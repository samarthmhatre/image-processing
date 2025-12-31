import os
import matlab.engine
from flask import Flask, request, jsonify, send_from_directory, send_file
from pathlib import Path
from flask_cors import CORS

# --- Configuration ---
OUTPUT_FOLDER = Path('output_images')
OUTPUT_FOLDER.mkdir(exist_ok=True)
INPUT_IMAGE_NAME = 'New_image.jpg'

# --- Flask App Initialization ---
app = Flask(__name__, static_folder='.', static_url_path='')
app.config['UPLOAD_FOLDER'] = OUTPUT_FOLDER

CORS(app)

# --- MATLAB Engine Initialization ---
eng = None
try:
    print("Starting MATLAB engine...")
    eng = matlab.engine.start_matlab()
    matlab_script_dir = str(Path(__file__).parent.resolve())
    eng.cd(matlab_script_dir, nargout=0)
    print(f"MATLAB working directory set to: {matlab_script_dir}")
except Exception as e:
    print(f"Error starting MATLAB engine: {e}")

# --- Web Routes ---

@app.route('/', methods=['GET'])
def index():
    return send_file('index.html') 

@app.route('/output_images/<path:filename>')
def serve_output(filename):
    return send_from_directory(OUTPUT_FOLDER, filename)

@app.route('/api/process_image', methods=['POST'])
def process_image():
    if not eng:
        return jsonify({'error': "MATLAB Engine is not running."}), 500

    try:
        # 1. Save the Uploaded File
        if 'image' not in request.files:
            return jsonify({'error': "No image uploaded"}), 400
        
        file = request.files['image']
        input_path = Path(__file__).parent / INPUT_IMAGE_NAME
        file.save(input_path)

        # 2. Get Transformation Type and Parameters
        trans_type = request.form.get('transformation')
        try:
            p1 = float(request.form.get('param1', 0))
            p2 = float(request.form.get('param2', 0))
        except ValueError:
            p1, p2 = 0, 0

        # 3. Set Defaults
        tx, ty = 0.0, 0.0
        sx, sy = 1.0, 1.0
        theta_degrees = 0.0
        make_neg = 0
        contrast_level = 0
        sharpness = 0.0

       
        if trans_type == 'Translation':
            tx, ty = p1, p2
        elif trans_type == 'Scaling':
            sx, sy = p1, p2
        elif trans_type == 'Rotating':
            theta_degrees = p1
        elif trans_type == 'Negative':
            make_neg = 1
        elif trans_type == 'Contrast of image':
            contrast_level = int(p1)
        elif trans_type == 'Image Sharpening':
            sharpness = p1

        # 4. Execute MATLAB Function
        output_dir_str = str(OUTPUT_FOLDER.resolve())
        input_image_str = str(input_path.resolve())

        
        eng.Image_Transformation(
            input_image_str, 
            trans_type,         
            float(tx), float(ty), 
            float(sx), float(sy), 
            float(theta_degrees), 
            float(make_neg), 
            float(contrast_level), 
            float(sharpness), 
            output_dir_str,
            nargout=0
        )

        # 5. Return Result
        output_filename = 'final_comparison.jpg' 
        return jsonify({
            'success': True,
            'processed_image_url': f'/output_images/{output_filename}'
        })

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'error': str(e)}), 500

#if __name__ == '__main__':
 #   app.run(debug=True)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)