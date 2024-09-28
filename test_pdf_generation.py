import requests
import json
import base64

# API endpoint
API_URL = "http://localhost:5000/api/pdf/generate/template1"

# Load sample data from template1.sample.json
with open("packages/server/src/templates/template1.sample.json", "r") as f:
    sample_data = json.load(f)

# Encode the sample data as base64
encoded_data = base64.b64encode(json.dumps(sample_data).encode()).decode()

# Make the request
response = requests.get(API_URL, params={"data": encoded_data, "upload": "false"})
print(API_URL + "?data=" + encoded_data + "&upload=false")

if response.status_code == 200:
    # Save the PDF buffer to a file
    with open("generated_pdf.pdf", "wb") as f:
        f.write(response.content)
    print("PDF generated and saved as 'generated_pdf.pdf'")
else:
    print(f"Error generating PDF: {response.status_code}")
    print(response.text)