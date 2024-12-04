const publicKey = "030e77f1badde54952ba"; // Your Uploadcare public key

const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const deleteButton = document.getElementById("deleteButton");
const gallery = document.getElementById("gallery");

// Upload image
uploadButton.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append("UPLOADCARE_PUB_KEY", publicKey);
        formData.append("UPLOADCARE_STORE", "auto");
        formData.append("file", file);

        try {
            const response = await fetch("https://upload.uploadcare.com/base/", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.file) {
                displayImage(data.cdn_url, data.file);
            } else {
                console.error("Upload failed:", data);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    }
});

// Fetch and display images
async function fetchImages() {
    const apiUrl = "https://api.uploadcare.com/files/";

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                Authorization: `Uploadcare.Simple ${publicKey}:`, // Correct Authorization header
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched files:", data);

        // Display all files
        data.results.forEach((file) => {
            displayImage(file.cdn_url, file.uuid);
        });
    } catch (error) {
        console.error("Error fetching images:", error);
    }
}

// Display image with delete radio button
function displayImage(url, uuid) {
    const item = document.createElement("div");
    item.classList.add("gallery-item");
    item.innerHTML = `
        <div class="content">
            <img src="${url}" alt="Image" />
            <input type="radio" name="deleteRadio" value="${uuid}" />
        </div>`;
    gallery.appendChild(item);
}

// Initial fetch
fetchImages();
