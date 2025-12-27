import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const auth = window.auth;
const db = window.db;

let currentUser = null;
let chart = null;

// AUTH STATE
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

// SIGNUP
window.signup = async () => {
  await createUserWithEmailAndPassword(auth, email.value, password.value);
  loginStatus.innerText = "Signup successful! Please login.";
};

// LOGIN
window.login = async () => {
  await signInWithEmailAndPassword(auth, email.value, password.value);

  loginStatus.innerText = "Login successful 💙";

  setTimeout(() => {
    loginDiv.style.display = "none";
    dashboard.style.display = "block";
    document.getElementById("dfMessenger").style.display = "block";
    loadMoods();
    loadReflections();
  }, 500);
};

// SAVE MOOD
window.saveMood = async () => {
  const mood = Number(moodSelect.value);
  if (!mood) return status.innerText = "Select a mood ❗";

  await addDoc(
    collection(db, "users", currentUser.uid, "moods"),
    { mood, timestamp: serverTimestamp() }
  );

  status.innerText = "Mood saved successfully 💙";
};

// SAVE REFLECTION
window.saveReflection = async () => {
  const text = reflectionText.value;
  const mood = moodSelect.value;

  if (!text || !mood) return alert("Add mood and reflection");

  await addDoc(
    collection(db, "users", currentUser.uid, "reflections"),
    {
      text,
      mood,
      timestamp: serverTimestamp()
    }
  );

  reflectionText.value = "";
};

// LOAD REFLECTION LIBRARY
function loadReflections() {
  const q = query(
    collection(db, "users", currentUser.uid, "reflections"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, (snap) => {
    library.innerHTML = "";
    snap.forEach(doc => {
      const d = doc.data();
      library.innerHTML += `
        <div class="library-item">
          <b>Mood:</b> ${d.mood}<br>${d.text}
        </div>`;
    });
  });
}

// LOAD MOOD GRAPH
function loadMoods() {
  const q = query(
    collection(db, "users", currentUser.uid, "moods"),
    orderBy("timestamp")
  );

  onSnapshot(q, (snap) => {
    const labels = [];
    const data = [];

    snap.forEach(doc => {
      labels.push(new Date(doc.data().timestamp?.seconds * 1000).toLocaleDateString());
      data.push(doc.data().mood);
    });

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("moodChart"), {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Mood Over Time",
          data,
          borderWidth: 2,
          fill: false
        }]
      }
    });
  });
}
