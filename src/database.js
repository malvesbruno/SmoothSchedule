import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, doc, getDoc, updateDoc, setDoc, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import { getMessaging, getToken, onMessage } from "firebase/messaging";



const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};


// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const cld = new Cloudinary({ cloud: { cloudName: 'dcikxq4qx' } });
const messaging = getMessaging(app);
const sha256 = require("crypto-js/sha256");


export const isAuthenticated = () => {
  return new Promise((resolve) => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(true); // Usuário está logado
      } else {
        resolve(false); // Usuário não está logado
      }
    });
  });
};

navigator.serviceWorker
  .register("/firebase-messaging-sw.js")
  .then((registration) => {
    console.log("Service Worker registrado com sucesso:", registration);
    return getToken(messaging, { vapidKey: "SUA_VAPID_KEY" });
  })
  .then((token) => {
    console.log("Token de notificação:", token);
  })
  .catch((err) => {
    console.error("Erro ao registrar o Service Worker:", err);
  });

const login = async (email, password) => {
  try {
    // Tenta fazer login com email e senha
    const user = await signInWithEmailAndPassword(auth, email, password);
    const userId = user.user.uid
    return userId
    console.log("Login bem-sucedido!");
    // Aqui você pode redirecionar ou fazer outra ação após o login bem-sucedido
  } catch (error) {
    // O Firebase retorna erros específicos que podem ser capturados aqui
    if (error.code === "auth/user-not-found") {
      console.error("Usuário não encontrado!");
      return "Email não cadastrado.";
    } else if (error.code === "auth/wrong-password") {
      console.error("Senha incorreta!");
      return "Senha incorreta.";
    } else {
      console.error("Erro desconhecido: ", error.message);
      return "Erro ao tentar fazer login.";
    }
  }
};

export const getDocByAuthUid = async () => {
  const auth = getAuth();
  const db = getFirestore();

  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Nenhum usuário autenticado.");
    }

    const uid = user.uid;

    const q = query(collection(db, "Company"), where("id", "==", uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();

      // Verifica se os campos 'user' e 'doc' existem no documento
      return { user: uid, doc: doc.id }; // Retorna os campos necessários
    } else {
      throw new Error("Nenhum documento encontrado com o UID do usuário.");
    }
  } catch (error) {
    console.error("Erro ao buscar documento pelo UID:", error);
    throw error;
  }
};

const signup = async (email, password) => {
  try {
    // Cria um novo usuário com email e senha
    const user = await createUserWithEmailAndPassword(auth, email, password);
    const userId = user.user.uid
    return userId
    console.log("Cadastro bem-sucedido!");

    // Aqui você pode redirecionar ou fazer outra ação após o cadastro bem-sucedido
  } catch (error) {
    // O Firebase retorna erros específicos que podem ser capturados aqui
    if (error.code === "auth/email-already-in-use") {
      console.error("Este email já está em uso.");
      return "Este email já está em uso.";
    } else if (error.code === "auth/invalid-email") {
      console.error("O email fornecido é inválido.");
      return "O email fornecido é inválido.";
    } else if (error.code === "auth/weak-password") {
      console.error("A senha fornecida é fraca.");
      return "A senha fornecida é muito fraca.";
    } else {
      console.error("Erro desconhecido: ", error.message);
      return "Erro ao tentar cadastrar.";
    }
  }
};

const uploadImage = async (id, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'SmoothScheduler'); // Substitua pelo seu upload preset
    formData.append('folder', `users/${id}/images`);

    const response = await fetch(`https://api.cloudinary.com/v1_1/dcikxq4qx/image/upload`, {
      method: 'POST',
      body: formData,
      api_key: "282371855328582",
      api_secret: "NypyHxSY9IeNn0SB9DWYAIxpdNs"
    });

    const data = await response.json();
    if (data.secure_url) {
      console.log('Imagem carregada com sucesso:', data.secure_url);
      return data.secure_url; // Retorna a URL da imagem
    } else {
      throw new Error('Erro ao carregar imagem no Cloudinary');
    }
  } catch (error) {
    console.error("Erro no upload da imagem:", error);
    throw new Error('Erro no upload da imagem');
  }
};



const addCompanyBasic = async (id, company, url_image, descricao, categoria, localizacao, facebook, whatsapp, telegram, instagram, telefone) => {
  try {
    // Verifica e substitui campos vazios por null
    const data = {
      id: id || null,
      company: company || "N/A",
      url_image: url_image || null,
      descricao: descricao || "N/A",
      categoria: categoria || "N/A",
      localizacao: localizacao || "N/A",
      facebook: facebook || null,
      whatsapp: whatsapp || null,
      telegram: telegram || null,
      instagram: instagram || null,
      telefone: telefone || null,
      inicio_teste: new Date().toISOString(),
      pago: false
    };

    const docRef = await addDoc(collection(db, 'Company'), data);
    return docRef.id
    console.log("Documento adicionado com ID: ", docRef.id);
  } catch (e) {
    console.error("Erro ao adicionar empresa: ", e);
  }
};



const editCompanyBasic = async (docId, company, url_image, descricao, categoria, localizacao, facebook, whatsapp, telegram, instagram, telefone) => {
  try {
    // Referência ao documento existente
    const docRef = doc(db, 'Company', docId);
    const data = {
      company: company || "N/A",
      url_image: url_image || null,
      descricao: descricao || "N/A",
      categoria: categoria || "N/A",
      localizacao: localizacao || "",
      facebook: facebook || null,
      whatsapp: whatsapp || null,
      telegram: telegram || null,
      instagram: instagram || null,
      telefone: telefone || null,
    };
    // Atualiza os campos fornecidos
    await updateDoc(docRef, data);
    console.log("Documento atualizado com sucesso!");
  } catch (e) {
    console.error("Erro ao atualizar empresa: ", e);
  }
};


const addAgentamentoInfo = async (id, pix, card, dinheiro, horas, time_json) => {
  try {
    const newData = {
      pix: pix || null,
      card: card || null,
      dinheiro: dinheiro || null,
      horas: horas || null,
      time_json: time_json || null,
      agendamentos: "[]"
    }
    const docRef = doc(db, "Company", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // 🔹 Adiciona os novos campos ao documento sem apagar os existentes
      await updateDoc(docRef, newData);
      console.log("Documento atualizado com sucesso!");
    } else {
      // 🔹 Se o documento não existir, cria um novo
      await setDoc(docRef, newData);
      console.log("Documento criado com sucesso!");
    }
  } catch (e) {
    console.error("Erro ao adicionar ou atualizar empresa: ", e);
  }
};

const editAgentamentoInfo = async (id, pix, card, dinheiro, horas, time_json) => {
  try {
    const newData = {
      pix: pix || null,
      card: card || null,
      dinheiro: dinheiro || null,
      horas: horas || null,
      time_json: time_json || null,
    }
    const docRef = doc(db, "Company", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // 🔹 Adiciona os novos campos ao documento sem apagar os existentes
      await updateDoc(docRef, newData);
      console.log("Documento atualizado com sucesso!");
    } else {
      // 🔹 Se o documento não existir, cria um novo
      await setDoc(docRef, newData);
      console.log("Documento criado com sucesso!");
    }
  } catch (e) {
    console.error("Erro ao adicionar ou atualizar empresa: ", e);
  }
};

const addServicoInfo = async (id, servico_json) => {
  try {
    const newData = {
      servico_json: servico_json || null
    }
    const docRef = doc(db, "Company", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // 🔹 Adiciona os novos campos ao documento sem apagar os existentes
      await updateDoc(docRef, newData);
      console.log("Documento atualizado com sucesso!");
    } else {
      // 🔹 Se o documento não existir, cria um novo
      await setDoc(docRef, newData);
      console.log("Documento criado com sucesso!");
    }
  } catch (e) {
    console.error("Erro ao adicionar ou atualizar empresa: ", e);
  }
};

const addCostumInfo = async (id, primary_color, secondary_color, third_color, bg_img) => {
  try {
    const newData = {
      primary_color: primary_color || null,
      secondary_color: secondary_color || null,
      third_color: third_color || null,
      bg_img: bg_img || null
    }
    const docRef = doc(db, "Company", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // 🔹 Adiciona os novos campos ao documento sem apagar os existentes
      await updateDoc(docRef, newData);
      console.log("Documento atualizado com sucesso!");
    } else {
      // 🔹 Se o documento não existir, cria um novo
      await setDoc(docRef, newData);
      console.log("Documento criado com sucesso!");
    }
  } catch (e) {
    console.error("Erro ao adicionar ou atualizar empresa: ", e);
  }
};

const addAgendamento = async (id, agendamento_json) => {
  try {
    const newData = {
      agendamentos: agendamento_json || null,
    }
    const docRef = doc(db, "Company", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // 🔹 Adiciona os novos campos ao documento sem apagar os existentes
      await updateDoc(docRef, newData);
      console.log("Documento atualizado com sucesso!");
    } else {
      // 🔹 Se o documento não existir, cria um novo
      await setDoc(docRef, newData);
      console.log("Documento criado com sucesso!");
    }
  } catch (e) {
    console.error("Erro ao adicionar ou atualizar empresa: ", e);
  }
};

const get_info = async (docID) => {
  try {
    const docRef = doc(db, "Company", docID); // Referência ao documento
    const docSnap = await getDoc(docRef); // Obtém o documento

    if (docSnap.exists()) {
      return docSnap.data(); // Retorna os dados do documento
    } else {
      console.log("Nenhum documento encontrado!");
      return null;
    }
  } catch (error) {
    console.error("Erro ao obter documento:", error);
    return null;
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    console.log("Logout bem-sucedido!");
    // Aqui você pode redirecionar o usuário para a página de login ou fazer outra ação após o logout
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
};


const getDocIdByItemId = async (itemId) => {
  try {
    // Referência à coleção 'Company'
    const companyCollection = collection(db, "Company");

    // Cria uma query para encontrar documentos onde o campo 'id' seja igual ao itemId
    const q = query(companyCollection, where("id", "==", itemId));

    // Executa a query
    const querySnapshot = await getDocs(q);

    // Verifica se há algum documento correspondente
    if (!querySnapshot.empty) {
      // Retorna o ID do primeiro documento encontrado
      const docId = querySnapshot.docs[0].id;
      console.log("UUID do documento encontrado:", docId);
      return docId;
    } else {
      console.log("Nenhum documento encontrado com o id:", itemId);
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar documento pelo id:", error);
    return null;
  }
};

// Função para deletar um documento pelo UID
const deleteDocByUid = async (uid) => {
  try {
    const db = getFirestore(); // Obtém a instância do Firestore
    const companyCollection = collection(db, "Company"); // Referência à coleção 'Company'

    // Cria uma query para encontrar documentos onde o campo 'id' seja igual ao UID
    const q = query(companyCollection, where("id", "==", uid));

    // Executa a query
    const querySnapshot = await getDocs(q);

    // Verifica se há algum documento correspondente
    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id; // Obtém o ID do documento
      const docRef = doc(db, "Company", docId); // Referência ao documento

      // Deleta o documento
      await deleteDoc(docRef);
      console.log(`Documento com UID ${uid} deletado com sucesso.`);
      return true;
    } else {
      console.log(`Nenhum documento encontrado com o UID: ${uid}`);
      return false;
    }
  } catch (error) {
    console.error("Erro ao deletar documento:", error);
    throw error;
  }
};

// Função para deletar o usuário autenticado atualmente
const deleteCurrentUserAndDoc = async () => {
  try {
    const auth = getAuth(); // Obtém a instância do Firebase Auth
    const user = auth.currentUser; // Obtém o usuário autenticado no momento

    if (!user) {
      console.error("Nenhum usuário autenticado.");
      return false;
    }

    const uid = user.uid; // Obtém o UID do usuário autenticado

    // Deleta o documento correspondente na coleção 'Company'
    const isDocDeleted = await deleteDocByUid(uid);

    if (isDocDeleted) {
      // Deleta o usuário do Firebase Authentication
      deleteUser(user)
      console.log("Usuário autenticado e seu documento foram deletados com sucesso.");
      return true;
    } else {
      console.error("Falha ao deletar o documento do usuário.");
      return false;
    }
  } catch (error) {
    console.error("Erro ao deletar usuário ou documento:", error);
    throw error;
  }
};

export { auth, db, login, signup, uploadImage, addCompanyBasic, addAgentamentoInfo,
   addServicoInfo, addCostumInfo, get_info, addAgendamento, logout, getDocIdByItemId,
   editCompanyBasic, editAgentamentoInfo, deleteCurrentUserAndDoc}; // Exporta individualmente
