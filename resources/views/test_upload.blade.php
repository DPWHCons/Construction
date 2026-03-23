<!DOCTYPE html>
<html>
<head>
    <title>Test Image Upload</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
    <h1>Test Image Upload</h1>
    <form action="/test-image-upload" method="POST" enctype="multipart/form-data">
        @csrf
        <div>
            <label>Images:</label>
            <input type="file" name="images[]" multiple accept="image/*">
        </div>
        <br>
        <button type="submit">Upload Images</button>
    </form>
    
    <div id="result"></div>
    
    <script>
        document.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = 'Uploading...';
            
            try {
                const response = await fetch('/test-image-upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });
                
                const result = await response.json();
                resultDiv.innerHTML = '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = 'Error: ' + error.message;
            }
        });
    </script>
</body>
</html>
