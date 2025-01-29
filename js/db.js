import { openDB } from "idb";

let db;

async function createDB() {
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction) {
                switch (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('livros', {
                            // A propriedade nome será o campo chave
                            keyPath: 'nome'
                        });
                        // Criando um índice id na store, deve estar contido no objeto do banco.
                        store.createIndex('id', 'id');
                        showResult("Banco de dados criado!");
                }
            }
        });
        showResult("Banco de dados aberto.");
    } catch (e) {
        showResult("Erro ao criar o banco de dados: " + e.message)
    }
}

window.addEventListener("DOMContentLoaded", async event => {
    createDB();

    document.getElementById("btnSalvar").addEventListener("click", addData);
    document.getElementById("btnListar").addEventListener("click", getData);
});

async function getData() {
    if (db == undefined) {
        showResult("O banco de dados está fechado");
        return;
    }

    const tx = await db.transaction('livros', 'readonly')
    const store = tx.objectStore('livros');
    const value = await store.getAll();
    if (value) {

        const listagem = value.map(livros => {
            return `<div class="livro-card">
                <img src="${livros.imagem}" alt="Imagem do livro ${livros.nome}">
                <p class="livro-nome"> ${livros.nome}</p>
                <p class="livro-autor">Autor: ${livros.autor}</p>
                <p class="livro-data">Data da leitura: ${livros.data}</p>
                <p class="livro-genero">Gênero: ${livros.genero}</p>
            </div>`
        })
        showResult(listagem.join(''))
    } else {
        showResult("Não há nenhum dado no banco!")
    }
}


async function addData() {
    let nome = document.getElementById("nome").value;
    let autor = document.getElementById("autor").value;
    let data = document.getElementById("data").value;
    let genero = document.getElementById("genero").value;
    let imagem = document.getElementById("camera--output").src;

    const tx = await db.transaction('livros', 'readwrite')
    const store = tx.objectStore('livros');
    try {
        await store.add({ 
            nome: nome, 
            autor: autor,
            data: data,
            genero: genero,
            imagem: imagem 
        });
        await tx.done;
        limparCampos();
        console.log('Registro adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar registro:', error);
        tx.abort();
    }
}

function showResult(text) {
    document.getElementById('resultados').innerHTML = text;
}

function limparCampos() {
    document.getElementById('nome').value = '';
    document.getElementById("autor").value = '';
    document.getElementById("data").value = '';
    document.getElementById("genero").value = '';
}