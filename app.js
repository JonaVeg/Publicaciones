// Importa las funciones necesarias de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, runTransaction, serverTimestamp, getDocs } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';

// Configura tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCaGaqkFjt11rjCZ2tscCy3YimzJV_gido",
  authDomain: "jonalogic-c8ecf.firebaseapp.com",
  projectId: "jonalogic-c8ecf",
  storageBucket: "jonalogic-c8ecf.appspot.com",
  messagingSenderId: "67802613164",
  appId: "1:67802613164:web:37579fb27c06b11dde6609"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Maneja el envío del formulario de publicaciones
document.getElementById('postForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = document.getElementById('postContent').value;

  if (content) {
    try {
      await addDoc(collection(db, 'posts'), {
        content: content,
        timestamp: serverTimestamp(),
        reactions: {
          like: 0,
          dislike: 0
        }
      });

      document.getElementById('postContent').value = '';
    } catch (error) {
      console.error("Error al agregar la publicación: ", error);
    }
  }
});

// Maneja el envío del formulario de respuestas
async function addResponse(postId, responseContent) {
  try {
    await addDoc(collection(db, `posts/${postId}/responses`), {
      content: responseContent,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al agregar la respuesta: ", error);
  }
}

// Carga las publicaciones desde Firestore en tiempo real
function loadPosts() {
  const postsContainer = document.getElementById('posts');

  // Escucha los cambios en la colección de publicaciones
  const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
  onSnapshot(q, (querySnapshot) => {
    postsContainer.innerHTML = '';

    querySnapshot.forEach(async doc => {
      const post = doc.data();
      const postId = doc.id;
      const postElement = document.createElement('div');
      postElement.className = 'card mb-3';
      postElement.innerHTML = `
        <div class="card-body">
          <p class="card-text">${post.content}</p>
          <button class="btn btn-success me-2" onclick="react('${postId}', 'like')">👍 Like (${post.reactions.like})</button>
          <button class="btn btn-danger" onclick="react('${postId}', 'dislike')">👎 Dislike (${post.reactions.dislike})</button>
          <form id="responseForm-${postId}" class="mt-3">
            <div class="mb-3">
              <label for="responseContent-${postId}" class="form-label">Respuesta</label>
              <textarea id="responseContent-${postId}" class="form-control" rows="2"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Responder</button>
          </form>
          <div id="responses-${postId}" class="mt-3">
            <!-- Aquí se mostrarán las respuestas -->
          </div>
        </div>
      `;
      postsContainer.appendChild(postElement);

      // Manejar el envío del formulario de respuesta
      document.getElementById(`responseForm-${postId}`).addEventListener('submit', async (e) => {
        e.preventDefault();
        const responseContent = document.getElementById(`responseContent-${postId}`).value;
        if (responseContent) {
          await addResponse(postId, responseContent);
          document.getElementById(`responseContent-${postId}`).value = '';
        }
      });

      // Cargar respuestas
      loadResponses(postId);
    });
  }, (error) => {
    console.error("Error al cargar las publicaciones:", error);
  });
}

// Carga las respuestas desde Firestore en tiempo real
function loadResponses(postId) {
  const responsesContainer = document.getElementById(`responses-${postId}`);

  // Escucha los cambios en la colección de respuestas para una publicación
  const q = query(collection(db, `posts/${postId}/responses`), orderBy('timestamp', 'asc'));
  onSnapshot(q, (querySnapshot) => {
    responsesContainer.innerHTML = '';

    querySnapshot.forEach(doc => {
      const response = doc.data();
      const responseElement = document.createElement('div');
      responseElement.className = 'card mb-2';
      responseElement.innerHTML = `
        <div class="card-body">
          <p class="card-text">${response.content}</p>
        </div>
      `;
      responsesContainer.appendChild(responseElement);
    });
  }, (error) => {
    console.error("Error al cargar las respuestas:", error);
  });
}

// Maneja las reacciones
async function react(postId, reactionType) {
  const postRef = doc(db, 'posts', postId);

  try {
    await runTransaction(db, async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists()) {
        throw "Documento no existe!";
      }

      const postData = postDoc.data();
      const newReactions = { ...postData.reactions };

      if (reactionType in newReactions) {
        newReactions[reactionType] += 1;
      } else {
        console.error("Tipo de reacción inválido:", reactionType);
        return;
      }

      transaction.update(postRef, { reactions: newReactions });
    });
  } catch (error) {
    console.error("Error al actualizar la reacción:", error);
  }
}

// Exponer las funciones globalmente
window.loadPosts = loadPosts;
window.react = react;

// Carga las publicaciones al cargar la página
window.onload = loadPosts;
