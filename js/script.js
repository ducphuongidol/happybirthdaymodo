

async function uploadImage() {
  const fileInput = document.getElementById('imageUpload');
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = async () => {
      const content = btoa(reader.result); // Convert file content to Base64
      const fileName = file.name;

      const response = await fetch(`${API_URL}/${fileName}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add ${fileName}`, // Commit message
          content: content, // Base64 encoded content
          branch: BRANCH, // Target branch
        }),
      });

      if (response.ok) {
        alert('Image uploaded!');
        loadGallery(); // Refresh the gallery
      } else {
        const error = await response.json();
        console.error('Upload failed:', error);
        alert('Failed to upload image.');
      }
    };

    reader.readAsBinaryString(file); // Read file as binary string
  } else {
    alert('No file selected.');
  }
}

async function loadGallery() {
  const galleryDiv = document.getElementById('gallery');
  galleryDiv.innerHTML = ''; // Clear gallery

  const response = await fetch(`${API_URL}?ref=${BRANCH}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  if (response.ok) {
    const files = await response.json();

    files.forEach((file) => {
      if (file.type === 'file') {
        const img = document.createElement('img');
        img.src = file.download_url;
        img.alt = file.name;
        img.style.width = '100px';

        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.onclick = () => deleteImage(file.name);

        galleryDiv.appendChild(img);
        galleryDiv.appendChild(deleteButton);
      }
    });
  } else {
    console.error('Failed to load gallery.');
  }
}

async function deleteImage(fileName) {
  const response = await fetch(`${API_URL}/${fileName}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  if (response.ok) {
    const fileData = await response.json();
    const sha = fileData.sha;

    const deleteResponse = await fetch(`${API_URL}/${fileName}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Delete ${fileName}`,
        sha: sha, // Required for deletion
        branch: BRANCH,
      }),
    });

    if (deleteResponse.ok) {
      alert('Image deleted!');
      loadGallery(); // Refresh the gallery
    } else {
      console.error('Failed to delete image.');
    }
  } else {
    console.error('Failed to fetch file info.');
  }
}

// Load gallery on page load
loadGallery();
