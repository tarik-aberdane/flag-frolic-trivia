export interface Question {
  question: string;
  options: string[];
  correct: number;
}

export const questions: Question[] = [
  {
    question: "¿Qué significa HTML?",
    options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyper Transfer Markup Language"],
    correct: 0,
  },
  {
    question: "¿Qué protocolo se usa para transferir páginas web?",
    options: ["FTP", "SMTP", "HTTP", "SSH"],
    correct: 2,
  },
  {
    question: "¿Qué tipo de memoria es volátil?",
    options: ["ROM", "SSD", "RAM", "HDD"],
    correct: 2,
  },
  {
    question: "¿Qué significa CSS?",
    options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"],
    correct: 1,
  },
  {
    question: "¿Cuál es la dirección IP de loopback?",
    options: ["192.168.1.1", "10.0.0.1", "127.0.0.1", "255.255.255.0"],
    correct: 2,
  },
  {
    question: "¿Qué comando muestra el contenido de un directorio en Linux?",
    options: ["dir", "ls", "show", "list"],
    correct: 1,
  },
  {
    question: "¿Qué significa SQL?",
    options: ["Structured Query Language", "Simple Query Logic", "Standard Question Language", "System Query Language"],
    correct: 0,
  },
  {
    question: "¿Qué puerto usa HTTPS por defecto?",
    options: ["80", "21", "443", "8080"],
    correct: 2,
  },
  {
    question: "¿Qué es un firewall?",
    options: ["Un tipo de virus", "Un sistema de seguridad de red", "Un navegador web", "Un sistema operativo"],
    correct: 1,
  },
  {
    question: "¿Cuál es el sistema de archivos por defecto en Linux?",
    options: ["NTFS", "FAT32", "ext4", "APFS"],
    correct: 2,
  },
  {
    question: "¿Qué significa DNS?",
    options: ["Data Network System", "Domain Name System", "Digital Network Service", "Dynamic Name Server"],
    correct: 1,
  },
  {
    question: "¿Qué capa del modelo OSI maneja el enrutamiento?",
    options: ["Capa 1", "Capa 2", "Capa 3", "Capa 4"],
    correct: 2,
  },
  {
    question: "¿Qué es una VLAN?",
    options: ["Virtual Local Area Network", "Very Large Area Network", "Visual LAN", "Variable Length Access Node"],
    correct: 0,
  },
  {
    question: "¿Qué comando se usa para cambiar permisos en Linux?",
    options: ["chown", "chmod", "chperm", "perm"],
    correct: 1,
  },
  {
    question: "¿Qué tipo de ataque intercepta comunicación entre dos partes?",
    options: ["DDoS", "Phishing", "Man-in-the-Middle", "Brute Force"],
    correct: 2,
  },
];

export function getRandomQuestion(): Question {
  return questions[Math.floor(Math.random() * questions.length)];
}
