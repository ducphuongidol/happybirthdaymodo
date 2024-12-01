const TOKEN = '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'; // Replace with your personal access token
const USERNAME = 'ducphuongidol'; // Replace with your GitHub username
const REPO = 'happybirthdaymodo'; // Replace with your repository name (no full URL)
const BRANCH = 'master'; // Replace with your branch name
const API_URL = `https://api.github.com/repos/${USERNAME}/${REPO}/contents/img`;

async function loadGallery() {
  const galleryDiv = document.getElementById('gallery');
  galleryDiv.innerHTML = ''; // Clear the gallery

  const response = await fetch(`${API_URL}?ref=${BRANCH}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  if (response.ok) {
    const files = await response.json();

    files.forEach((file) => {
      if (file.type === 'file') {
        const img = document.createElement('img');
        img.src = file.download_url; // Correct usage of the download URL
        img.alt = file.name;
        img.style.width = '100px'; // Set image size

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

    reader.readAsDataURL(file); // Read file as Data URL (Base64)
  } else {
    alert('No file selected.');
  }
}

// Initial load of the gallery when the page loads
loadGallery();
