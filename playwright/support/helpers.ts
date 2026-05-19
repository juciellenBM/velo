

export function gerarNumPed() {
    const prefixo = "VLO-";
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    let codigo = "";
  
    for (let i = 0; i < 6; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      codigo += caracteres[indiceAleatorio];
    }
  
    return prefixo + codigo;
  }
