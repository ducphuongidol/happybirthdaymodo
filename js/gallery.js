const publicKey = "030e77f1badde54952ba"; // Your Uploadcare public key
const secretKey = "ca98399ea0a6409a32f2"; // Replace with your Uploadcare secret key
const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const deleteButton = document.getElementById("deleteButton");
const gallery = document.getElementById("gallery");

// Debounce function to limit the rate at which a function can fire
const debounce = (func, wait) => {
    let timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), wait);
    };
};

// Helper functions for dynamic grid layout
const getVal = (elem, style) => parseInt(window.getComputedStyle(elem).getPropertyValue(style));
const getHeight = (item) => item.querySelector('.content').getBoundingClientRect().height;

const resizeAll = () => {
    const altura = getVal(gallery, 'grid-auto-rows'); // Base height
    const gap = getVal(gallery, 'grid-gap'); // Grid gap
    gallery.querySelectorAll('.gallery-item').forEach((item) => {
        const el = item;
        el.style.gridRowEnd = "span " + Math.ceil((getHeight(item) + gap) / (altura + gap));
    });
};

// Resize observer for dynamic resizing
const resizeObserver = new ResizeObserver(resizeAll);
resizeObserver.observe(gallery);

window.addEventListener('resize', debounce(resizeAll, 100));

// Upload image
uploadButton.addEventListener("click", async () => {
    const file = fileInput.files[0];

    if (!file) {
        alert("Please choose a file before uploading.");
        return;
    }

    const formData = new FormData();
    formData.append("UPLOADCARE_PUB_KEY", publicKey);
    formData.append("UPLOADCARE_STORE", "1"); // Ensure files are stored
    formData.append("file", file);

    try {
        const response = await fetch("https://upload.uploadcare.com/base/", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        if (data.file) {
            // Fetch the image details to get the URL
            const imageDetails = await fetchImageDetails(data.file);
            if (imageDetails) {
                displayImage(imageDetails.original_file_url, imageDetails.uuid);
                fileInput.value = ""; // Reset the file input
            }
        } else {
            console.error("Upload failed:", data);
        }
    } catch (error) {
        console.error("Error uploading image:", error);
    }
});

// Fetch image details by UUID
async function fetchImageDetails(fileUuid) {
    const apiUrl = `https://api.uploadcare.com/files/${fileUuid}/`;

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                Authorization: `Uploadcare.Simple ${publicKey}:${secretKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const fileData = await response.json();
        return fileData;
    } catch (error) {
        console.error("Error fetching image details:", error);
        return null;
    }
}

// Fetch and display images
async function fetchImages() {
    const apiUrl = "https://api.uploadcare.com/files/";

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                Authorization: `Uploadcare.Simple ${publicKey}:${secretKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched files:", data);

        // Handle results
        data.results.forEach((file) => {
            const imageUrl = file.original_file_url || ""; // Use the correct field for the URL
            if (imageUrl) {
                displayImage(imageUrl, file.uuid);
            } else {
                console.warn("No valid URL for file:", file);
            }
        });

        // Recalculate layout after all images are added
        resizeAll();
    } catch (error) {
        console.error("Error fetching images:", error);
    }
}

// Display image in the gallery
function displayImage(url, uuid) {
    const item = document.createElement("div");
    item.classList.add("gallery-item");
    item.innerHTML = `
        <div class="content">
            <img src="${url}" alt="Image" data-uuid="${uuid}" />
            <input type="radio" name="deleteRadio" value="${uuid}" />
        </div>`;
    gallery.appendChild(item);

    const img = item.querySelector('img');
    img.addEventListener('click', () => {
        openImageInModal(url); // Open the image in a modal on click
    });

    // Adjust grid layout for the newly added image
    if (img.complete) {
        adjustGridItem(item);
    } else {
        img.addEventListener('load', () => adjustGridItem(item));
    }
}

// Open the image in a modal with animation
function openImageInModal(url) {
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const caption = document.getElementById("caption");

    modal.style.display = "block"; // Show the modal
    modalImage.src = url; // Set the image source to the clicked image

    // Clear the caption text (this removes any existing caption)
    caption.textContent = ""; // Remove the caption text

    // Add the 'active' class to trigger the animation
    modalImage.classList.add("active");

    const closeModal = document.querySelector(".close");
    closeModal.onclick = () => {
        modal.style.display = "none"; // Hide the modal on close
        modalImage.classList.remove("active"); // Remove the animation class
    };

    // Close modal when clicking outside the image
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
            modalImage.classList.remove("active"); // Remove animation on close
        }
    };
}

// Adjust grid for a specific item
function adjustGridItem(item) {
    const altura = getVal(gallery, 'grid-auto-rows');
    const gap = getVal(gallery, 'grid-gap');
    item.style.gridRowEnd = "span " + Math.ceil((getHeight(item) + gap) / (altura + gap));
}

// Delete selected image
deleteButton.addEventListener("click", async () => {
    const selectedRadio = document.querySelector('input[name="deleteRadio"]:checked');
    if (selectedRadio) {
        const fileUuid = selectedRadio.value; // Get the file UUID

        try {
            const response = await fetch(`https://api.uploadcare.com/files/${fileUuid}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Uploadcare.Simple ${publicKey}:${secretKey}`,
                },
            });

            if (response.ok) {
                console.log(`File with UUID ${fileUuid} deleted.`);
                // Remove the image from the gallery
                selectedRadio.closest(".gallery-item").remove();
                resizeAll(); // Adjust layout after deletion
            } else {
                throw new Error(`Failed to delete file. Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    } else {
        alert("Please select an image to delete.");
    }
});

// Initial fetch
fetchImages();
