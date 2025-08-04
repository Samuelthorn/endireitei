const HF_TOKEN = "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"; // seu token do Hugging Face
const MODEL = "tiiuae/falcon-7b-instruct";

const gerarBtn = document.getElementById('gerar');
const resultadoDiv = document.getElementById('resultado');
const canvas = document.getElementById('storyCanvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');

gerarBtn.addEventListener('click', async () => {
  const categoria = document.getElementById('categoria').value;
  const descricao = document.getElementById('descricao').value.trim();

  if (!descricao) {
    alert("Descreva a situação para gerar a indireta!");
    return;
  }

  gerarBtn.disabled = true;
  gerarBtn.textContent = "Gerando...";

  try {
    // 1. Gerar texto usando Hugging Face Falcon
    const prompt = `Crie uma indireta curta e provocativa para Instagram Stories, tom ${categoria}, sobre: "${descricao}". Não cite nomes, mas deixe a pessoa curiosa.`;

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();
    console.log(data); // debug
    const indireta = data[0]?.generated_text || "Não consegui gerar, tente de novo.";

    // 2. Desenhar imagem estilo story
    desenharStory(indireta);

    // 3. Mostrar e permitir download
    resultadoDiv.style.display = "flex";
    const dataURL = canvas.toDataURL("image/png");
    downloadBtn.href = dataURL;

  } catch (err) {
    alert("Erro ao gerar indireta: " + err.message);
  } finally {
    gerarBtn.disabled = false;
    gerarBtn.textContent = "Gerar Indireta";
  }
});

function desenharStory(texto) {
  // Fundo degradê
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#ff758c");
  grad.addColorStop(1, "#ff7eb3");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Texto centralizado
  ctx.fillStyle = "#fff";
  ctx.font = "60px Poppins";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  wrapText(ctx, texto, canvas.width / 2, canvas.height / 2, 900, 80);
}

// Função para quebrar texto em várias linhas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lines = [];
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  const totalHeight = lines.length * lineHeight;
  const startY = y - totalHeight / 2;

  lines.forEach((l, i) => {
    ctx.fillText(l, x, startY + i * lineHeight);
  });
}
