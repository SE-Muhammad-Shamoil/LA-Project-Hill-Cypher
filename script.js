const keyMatrix = [
  [6, 24, 1],
  [13, 16, 10],
  [20, 17, 15],
];

function cleanText(text) {
  return text.toUpperCase().replace(/[^A-Z ]/g, "");
}

function modInverseMatrix(matrix) {
  const det =
    (matrix[0][0] *
      (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
      matrix[0][1] *
        (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
      matrix[0][2] *
        (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])) % 26;

  const modInv = (a, m) => {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) return x;
    }
    return null;
  };

  const invDet = modInv(det, 26);
  if (invDet === null) return null;

  const adj = [];
  adj[0] = [
    (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) % 26,
    -(matrix[0][1] * matrix[2][2] - matrix[0][2] * matrix[2][1]) % 26,
    (matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]) % 26,
  ];
  adj[1] = [
    -(matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) % 26,
    (matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0]) % 26,
    -(matrix[0][0] * matrix[1][2] - matrix[0][2] * matrix[1][0]) % 26,
  ];
  adj[2] = [
    (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]) % 26,
    -(matrix[0][0] * matrix[2][1] - matrix[0][1] * matrix[2][0]) % 26,
    (matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]) % 26,
  ];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      adj[i][j] = (((adj[i][j] * invDet) % 26) + 26) % 26;
    }
  }

  return adj;
}

function multiplyMatrix(mat, vec) {
  const result = [];
  for (let i = 0; i < 3; i++) {
    result[i] = 0;
    for (let j = 0; j < 3; j++) {
      result[i] += mat[i][j] * vec[j];
    }
    result[i] %= 26;
  }
  return result;
}

function insertSpaces(original, transformed) {
  let result = "";
  let i = 0;
  for (const ch of original) {
    if (ch === " ") {
      result += " ";
    } else {
      result += transformed[i++] || ""; 
    }
  }
  

  if (i < transformed.length) {
    result += transformed.slice(i);
  }
  return result;
}


function encrypt(message) {
  const clean = cleanText(message);
  const letters = clean.replace(/ /g, '').split('');
  const paddingNeeded = (3 - (letters.length % 3)) % 3;

  for (let i = 0; i < paddingNeeded; i++) {
    letters.push('X');
  }
  console.log(paddingNeeded)

  let cipher = '';
  for (let i = 0; i < letters.length; i += 3) {
    const nums = letters.slice(i, i + 3).map(c => c.charCodeAt(0) - 65);
    const res = multiplyMatrix(keyMatrix, nums);
    cipher += res.map(n => String.fromCharCode(n + 65)).join('');
  }
  console.log(cipher);
  const spaced = insertSpaces(clean, cipher);
  return spaced + paddingNeeded;
}

function decrypt(ciphertext) {
  const inverseKey = modInverseMatrix(keyMatrix);
  if (!inverseKey) return "Key matrix not invertible.";

  const paddingCount = parseInt(ciphertext[ciphertext.length - 1], 10);
  const textBody = ciphertext.slice(0, -1);

  const clean = cleanText(textBody);
  const letters = clean.replace(/ /g, '').split('');

  let message = '';
  for (let i = 0; i < letters.length; i += 3) {
    const nums = letters.slice(i, i + 3).map(c => c.charCodeAt(0) - 65);
    const res = multiplyMatrix(inverseKey, nums);
    message += res.map(n => String.fromCharCode(n + 65)).join('');
  }

  const spaced = insertSpaces(clean, message);
  return spaced.slice(0, spaced.length - paddingCount);
}

function processMessage() {
  const msg = document.getElementById("message").value;
  const action = document.getElementById("action").value;
  const resultEl = document.getElementById("result");

  const result = action === "encrypt" ? encrypt(msg) : decrypt(msg);
  resultEl.textContent = result;
}
