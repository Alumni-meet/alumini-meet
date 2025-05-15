from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import docx2txt
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import os

app = Flask(__name__)
CORS(app)

def clean_text(text):
    text = re.sub(r'[^\w\s]', '', text)
    text = text.lower()
    return text

def extract_keywords(text):
    vectorizer = CountVectorizer(stop_words='english')
    X = vectorizer.fit_transform([text])
    keywords = vectorizer.get_feature_names_out()
    return set(keywords)

@app.route('/ats-score', methods=['POST'])
def ats_score():
    try:
        if 'resume' not in request.files or 'job_description' not in request.form:
            return jsonify({"error": "Missing 'resume' file or 'job_description' field."}), 400
        
        resume_file = request.files['resume']
        job_description = request.form['job_description']
        
        temp_resume_path = './temp_resume'
        file_extension = os.path.splitext(resume_file.filename)[1].lower()
        resume_text = ""
        
        if file_extension == '.pdf':
            temp_resume_path += '.pdf'
            resume_file.save(temp_resume_path)
            
            with open(temp_resume_path, 'rb') as pdfFileObject:
                pdfReader = PyPDF2.PdfReader(pdfFileObject)
                
                if len(pdfReader.pages) > 0:
                    for page_num in range(len(pdfReader.pages)):
                        pageObject = pdfReader.pages[page_num]
                        resume_text += pageObject.extract_text() + "\n"
                else:
                    os.remove(temp_resume_path)
                    return jsonify({"error": "The PDF file is empty or has no pages."}), 400
        
        elif file_extension == '.docx':
            temp_resume_path += '.docx'
            resume_file.save(temp_resume_path)
            
            resume_text = docx2txt.process(temp_resume_path)
        
        else:
            return jsonify({"error": "Unsupported file format. Only PDF and DOCX files are allowed."}), 400
        
        resume_clean = clean_text(resume_text)
        JD_clean = clean_text(job_description)
        
        content = [resume_clean, JD_clean]
        vectorizer = CountVectorizer().fit(content)
        matrix = vectorizer.transform(content)
        
        similarityMatrix = cosine_similarity(matrix)
        similarityScore = similarityMatrix[0][1] * 100  
        
        JD_keywords = extract_keywords(JD_clean)
        resume_keywords = extract_keywords(resume_clean)
        
        missing_keywords = list(JD_keywords - resume_keywords)
        
        output = {
            "ats_score": f"{similarityScore:.2f}%",
            "missing_keywords": missing_keywords
        }
        
        if os.path.exists(temp_resume_path):
            os.remove(temp_resume_path)
        
        return jsonify(output), 200
    
    except FileNotFoundError:
        return jsonify({"error": "The resume file was not found."}), 400
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port) 