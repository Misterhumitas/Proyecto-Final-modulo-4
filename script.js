const API_BASE = 'https://sample-dogs-api.netlify.app/api/v1/';

async function fetchAndRenderDogs() {
    const dogsContainer = document.getElementById('dogs-container');
    const fetchDogsButton = document.getElementById('fetch-dogs');
    fetchDogsButton.textContent = 'Cargando...';

    try {
        const response = await fetch(`${API_BASE}/dogs`);
        if (!response.ok) throw new Error('Error al obtener datos de la API');
        
        const dogs = await response.json();

        dogsContainer.innerHTML = '';

        if (dogs.length === 0) {
            dogsContainer.innerHTML = '<p>No hay perros para mostrar.</p>';
            fetchDogsButton.textContent = 'No hay más perros';
            return;
        }

        fetchDogsButton.textContent = 'Obtener Perros';

        dogs.forEach((dog) => {
            const dogCard = document.createElement('div');
            dogCard.classList.add('dog-card');
            dogCard.innerHTML = `
                <img src="${dog.image}" alt="${dog.name}" class="dog-image">
                <h3>${dog.name}</h3>
                <p>Raza: ${dog.breed}</p>
                <div class="dog-extra-info">
                    <p>Juguete favorito: ${dog.favoriteToy || 'N/A'}</p>
                    <p>Edad: ${dog.age || 'N/A'}</p>
                    <p>Color: ${dog.color || 'N/A'}</p>
                    <p>Descripción: ${dog.bio || 'Sin descripción'}</p>
                </div>
                <button class="edit-button" data-id="${dog._id}">Editar</button>
                <button class="delete-button" data-id="${dog._id}">Eliminar</button>
            `;
            dogsContainer.appendChild(dogCard);
        });
    } catch (err) {
        console.error('Error al obtener perros:', err);
        dogsContainer.innerHTML = '<p>Error al cargar los perros. Intenta de nuevo más tarde.</p>';
        fetchDogsButton.textContent = 'Reintentar';
    }
}

async function addNewDog(dogData) {
    try {
        const response = await fetch(`${API_BASE}/dogs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dogData),
        });
        if (!response.ok) throw new Error('Error al agregar el perro');
        fetchAndRenderDogs();
    } catch (err) {
        console.error('Error al agregar el perro:', err);
    }
}

async function deleteDog(dogId) {
    try {
        const response = await fetch(`${API_BASE}/dogs/${dogId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar el perro');
        fetchAndRenderDogs();
    } catch (err) {
        console.error('Error al eliminar el perro:', err);
    }
}

async function openEditForm(dogId) {
    try {
        const response = await fetch(`${API_BASE}/dogs/${dogId}`);
        if (!response.ok) throw new Error('Error al obtener datos del perro');
        
        const dog = await response.json();
        const editForm = document.getElementById('add-dog-form');

        editForm.name.value = dog.name || '';
        editForm.breed.value = dog.breed || '';
        editForm.image.value = dog.image || '';
        editForm.color.value = dog.color || '';
        editForm.age.value = dog.age || '';
        editForm.favoriteToy.value = dog.favoriteToy || '';
        editForm.personality.value = dog.personality || '';
        editForm.bio.value = dog.bio || '';

        const submitButton = editForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Guardar Cambios';
        submitButton.dataset.editing = dogId;
    } catch (err) {
        console.error('Error al abrir el formulario de edición:', err);
    }
}

async function updateDog(dogId, updatedData) {
    try {
        const response = await fetch(`${API_BASE}/dogs/${dogId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) throw new Error('Error al actualizar el perro');
        fetchAndRenderDogs();
    } catch (err) {
        console.error('Error al actualizar el perro:', err);
    }
}

const addDogForm = document.getElementById('add-dog-form');
addDogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(addDogForm);
    const dogData = Object.fromEntries(formData.entries());
    const editingId = e.target.querySelector('button[type="submit"]').dataset.editing;

    if (editingId) {
        await updateDog(editingId, dogData);
        e.target.querySelector('button[type="submit"]').textContent = 'Agregar Perro';
        delete e.target.querySelector('button[type="submit"]').dataset.editing;
    } else {
        await addNewDog(dogData);
    }

    addDogForm.reset();
});

const dogsContainer = document.getElementById('dogs-container');
dogsContainer.addEventListener('click', async (e) => {
    const dogId = e.target.dataset.id;
    if (e.target.classList.contains('delete-button')) {
        await deleteDog(dogId);
    } else if (e.target.classList.contains('edit-button')) {
        openEditForm(dogId);
    }
});

document.getElementById('fetch-dogs').addEventListener('click', fetchAndRenderDogs);

fetchAndRenderDogs();
