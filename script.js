// si prende il saldo memorizzato in locale, oppure se non esiste lo setta a 1000

//let saldo = parseInt($('#saldo').text());
let saldo;
if(localStorage.getItem("saldo")){
    saldo = localStorage.getItem("saldo");
} else {
    saldo = 1000;
}
mostraSaldoAggiornato();

//Condizione per ricaricare il saldo scarico
if(saldo==0){
    $('#ricaricaSaldo').show();
    $('#ricaricaSaldo').on('click', ()=>{
        saldo = 1000;
        localStorage.setItem("saldo", saldo);
        location.reload();
    });
}

// Questa funzione permette di eseguire le istruzioni dopo un certo intervallo di tempo
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// La classe Mano definisce i metodi e le variabili comuni per tutte le mani giocate in caso di Split
class Mano {
    punteggio = 0;
    totPuntata = 0;
    profitto = 0;
    esito = "";
    playerBlackJack=false;
    carteinMano = [];
    sballato=false;
    aceCount = 0;

    //Questa funzione riduce il valore degli assi qualora il punteggio superasse il valore di 21
    reducePlayerAces() {
        while (this.punteggio > 21 && this.aceCount > 0) {
        this.punteggio -= 10;
        this.aceCount --;
        }    
    }

    //Distribuisce la prima carta al giocatore
    async playerFirstHit(){ 
        
        play("flipcard"); 
        let tagImg = document.createElement("img");
        tagImg.id='playerFirstCard';
        let card = "A-cuori";
        tagImg.src = "./cards/" + card + ".svg";
        this.carteinMano.push(card);
        this.punteggio += getValue(card);
        this.aceCount += checkAce(card);

        $('.containerMano[data-mano="1"]').find('.containerCarteGiocatore').append(tagImg);

        this.reducePlayerAces(); 
        $('.containerMano[data-mano="1"]').find('.punteggio').text(this.punteggio);               
    }

    //Distribuisce la seconda carta al giocatore
    async playerSecondHit(){ 
        play("flipcard");  
        let tagImg = document.createElement("img");
        tagImg.classList.add('playerSecondCard');
        let card = "A-picche";
        tagImg.src = "./cards/" + card + ".svg";
        this.carteinMano.push(card);
        this.punteggio += getValue(card);
        this.aceCount += checkAce(card);
        $('.containerMano[data-mano="1"]').find('.containerCarteGiocatore').append(tagImg);

        this.reducePlayerAces(); 
        $('.containerMano[data-mano="1"]').find('.punteggio').text(this.punteggio);            
    }

    //Aggiorna il profitto e il saldo in caso di vittoria
    vittoria(){
        if (this.playerBlackJack==true){
            this.profitto=this.totPuntata*2.5;            
        } else {
            this.profitto=this.totPuntata*2;
        }
        saldo += this.profitto;
        mostraSaldoAggiornato();
        this.esito='Vittoria!';
        play('victory');        
    }
    
    //Aggiorna il profitto e il saldo in caso di pareggio
    pareggio(){
        saldo+=this.totPuntata;
        mostraSaldoAggiornato();
        this.esito='Pareggio!';
        play('draw');
    }
    
    //Aggiorna il profitto e il saldo in caso di sconfitta
    sconfitta(){
        this.esito='Sconfitta'; 
        play('defeat');       
    }
}

let deck = [];
let mani = [];
const mano1 = new Mano();   //Inizializza la prima mano
mani.push(mano1);           //Aggiunge la prima mano all'array di mani

let intervallo=1000;
let punteggioDealer = 0;

let saldoIniziale = 0;
let dealerFirstCard="";
let cartaCopertaImage="";
let cartaCoperta;
let dealerBlackJack=false;
let isSplit=false;
let dealerAceCount = 0;
let puntataIniziale = 0;
let puntataAssicurazione = 0;
const containerMano1 = $('.containerMano[data-mano=1]');
let containerBianco = containerMano1.clone();
let counterMani = 0;

buildDeck();
shuffleDeck();

viewPuntataIniziale(); //Visualizza la puntata nella schermata della puntata iniziale
puntata();

function play(id){
    let audio = document.getElementById(id);
    audio.pause();    // Ferma l'audio se è ancora in riproduzione
    audio.currentTime = 0; // Riporta l'audio all'inizio
    audio.play();
}

function checkAssoDealer(){
    if (dealerFirstCard[0] == 'A'){
        $('#intestazioneAssicurazione').hide();
        if((puntataIniziale/2)>saldo){
            checkDealerBlackJack(); 
            return;
        }
        $('#containerAssicurazione').css('visibility', 'visible');

        $('#sì').on('click', assicurazione);
    
        $('#no').on('click', () => {
            $('#containerAssicurazione').css('visibility', 'hidden');
            checkDealerBlackJack();        
        });
    }
    else {
        mostraAzioni(1);
    }    
}

function assicurazione(){
    play("clickPuntata"); 
    puntataAssicurazione=puntataIniziale/2;
    saldo-=puntataAssicurazione;
    mostraSaldoAggiornato();
    $('#puntataAssicurazione').text(puntataAssicurazione);
    $('#alertAssicurazione').hide();
    $('#containerAssicurazione').html('<br><br>');
    $('#intestazioneAssicurazione').show();
    
    checkDealerBlackJack();   
}

function checkDealerBlackJack(){
    if(punteggioDealer==21){
        dealerBlackJack=true;
        endGame();
    }
    else {
        mostraAzioni(1);
    }
}

function raddoppia(nMano){
    const containerMano = $('.containerMano[data-mano='+nMano+']');
    let mano = mani[nMano-1]; 
    nascondiAzioni(nMano);
     
    saldo-=puntataIniziale;
    mostraSaldoAggiornato();
    mano.totPuntata*=2;
    containerMano.find('.puntataMano').text("Totale puntata: "+mano.totPuntata); 

    hit(nMano);
    if (mano.punteggio < 21) {
        stay(nMano);
    }
}

function nascondiRaddoppia(nMano){
    const containerMano = $('.containerMano[data-mano='+nMano+']');
    containerMano.find('.raddoppia').hide();
}
function nascondiSplit(nMano){
    const containerMano = $('.containerMano[data-mano='+nMano+']');
    containerMano.find('.split').hide();
}
async function hit(nMano) {
    const containerMano = $('.containerMano[data-mano='+nMano+']');
    let mano = mani[nMano-1];

    nascondiRaddoppia(nMano);
    nascondiSplit(nMano);

    play("flipcard");     
    let tagImg = document.createElement("img");
    let card = deck.pop();
    tagImg.src = "./cards/" + card + ".svg";
    mano.carteinMano.push(card);
    mano.punteggio += getValue(card);
    mano.aceCount += checkAce(card);
    containerMano.find('.containerCarteGiocatore').append(tagImg);
    
    mano.reducePlayerAces();
    
    containerMano.find('.punteggio').text(mano.punteggio);
    
    if (mano.punteggio >= 21) {
        if(mano.punteggio==21){
            stay(nMano);
        } else {
            mano.sballato = true;
            stay(nMano);
        }        
    }        
}

async function stay(nMano) {

    nascondiAzioni(nMano);

    console.log("Lunghezza dell'array mani:", mani.length);
    console.log("Valore di nMano:", nMano);
    if(mani[nMano] !== undefined){  //se esiste una mano successiva, passa alla prossima, altrimenti termina il gioco
        console.log("sono entrato nella seconda mano");
        nascondiAzioni(nMano);
        mostraAzioni(nMano+1);
    } else {
        endGame();
    }   
}

async function endGame(){
    await delay(intervallo);

    play('flipcard');
    $('#cartaCoperta').attr('src', './cards/' + cartaCoperta + '.svg'); //svela la carta coperta
    if(dealerBlackJack==true){
        $('#punteggioDealer').text('Black Jack!');
        saldo+=puntataAssicurazione*2;
        mostraSaldoAggiornato();
        $('#intestazioneAssicurazione').append('<br>Assicurazione vinta!');
    } else {
        $('#punteggioDealer').text(punteggioDealer);
    }
          
    await delay(intervallo);
    
    let tuttiSballati=true;

    for (let mano of mani){
        if(mano.sballato==false && mano.playerBlackJack==false){
            tuttiSballati=false;
            break;
        } 
    }

    if(tuttiSballati==false){
        while (punteggioDealer < 17) {
            dealerHit();
            reduceDealerAces();
            await delay(intervallo);
        }
    }

    for (const [indice, mano] of mani.entries()) {
        await delay(intervallo);
        
        if (mano.punteggio > 21) {
            mano.sconfitta();
            const containerMano = $('.containerMano[data-mano='+(indice+1)+']');
            containerMano.find('.esito').addClass('sfondoRosso');
            containerMano.find('.esito').text(mano.esito);

        } else if (punteggioDealer > 21) {
            mano.vittoria();
            const containerMano = $('.containerMano[data-mano='+(indice+1)+']');
            containerMano.find('.esito').addClass('sfondoVerde');
            containerMano.find('.esito').text(mano.esito);
        } else if (mano.punteggio === punteggioDealer) {
            if(mano.playerBlackJack==true){
                if(dealerBlackJack==true){
                    mano.pareggio();
                    const containerMano = $('.containerMano[data-mano='+(indice+1)+']');
                    containerMano.find('.esito').addClass('sfondoGiallo');                   
                }
                else {
                    mano.vittoria();
                    const containerMano = $('.containerMano[data-mano='+(indice+1)+']');
                    containerMano.find('.esito').addClass('sfondoVerde');  
                }
            } 
            else {
                mano.pareggio();
                const containerMano = $('.containerMano[data-mano='+(indice+1)+']');
                containerMano.find('.esito').addClass('sfondoGiallo');  
            }
            
            const containerMano = $('.containerMano[data-mano='+(indice+1)+']');
            containerMano.find('.esito').text(mano.esito);
        } else if (mano.punteggio > punteggioDealer) {
            mano.vittoria();
            const containerMano = $('.containerMano[data-mano='+(indice+1)+']');
            containerMano.find('.esito').addClass('sfondoVerde'); 
            containerMano.find('.esito').text(mano.esito);
            
        } else {
            mano.sconfitta();
            const containerMano = $('.containerMano[data-mano='+(indice+1)+']');
            containerMano.find('.esito').addClass('sfondoRosso'); 
            containerMano.find('.esito').text(mano.esito);
        }        
    }

    await delay(intervallo);

    let ricavo = saldo - saldoIniziale;
    
    if(ricavo>0){
        $('#profitto').text("Vincita totale: "+ricavo);
    }else if (ricavo<0){
        $('#profitto').text("Perdita totale: "+ricavo);
    } else {
        $('#profitto').text("Saldo invariato");
    }

    /*

    let sommaPuntate=0;
	
	for (let mano of mani){
		sommaPuntate+=mano.totPuntata;		
	}
	
	sommaPuntate+=puntataAssicurazione;
	
    var dati ={
        saldo: saldo,
        puntata: sommaPuntate
    }
    fetch('/g', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dati)
    })
    
    */

    localStorage.setItem("saldo", saldo);

    $('#rigioca').show();

    $('#rigioca').on('click', () => location.reload()); 
}

function mostraSaldoAggiornato(){
    $("#saldo").text(saldo);
}

function viewPuntataIniziale(){ // visualizza la puntata della schermata dove si punta
    $('#totalePuntata').text(puntataIniziale);
}

function puntata(){

    $('.buttonsPuntate').on({
        mouseover: function() {
            play("mouseoverPuntate");  
        },
        click: function() {
            play("clickPuntata"); 
        }
    });

    $('#button5').on('click', () => aumentaPuntata(5));
    $('#button10').on('click', () => aumentaPuntata(10));
    $('#button20').on('click', () => aumentaPuntata(20));
    $('#button50').on('click', () => aumentaPuntata(50));
    $('#button100').on('click', () => aumentaPuntata(100));
    $('#button500').on('click', () => aumentaPuntata(500));
    $('#button1000').on('click', () => aumentaPuntata(1000));

    $('#ripristinaPuntata').on('click', ripristinaPuntata);

    $('#buttonConferma').on('click', () => {
        if (puntataIniziale > 0 && puntataIniziale <= saldo) {
            startGame(); // Avvia il gioco se la puntata è stata fatta e non è superiore al saldo
        } else if (puntataIniziale == 0) {
            $('#errorePuntata').text('Devi puntare prima di giocare!');
        } else if (puntataIniziale > saldo) {
            $('#errorePuntata').text('Non puoi puntare un importo superiore al tuo saldo attuale');
        }
    });
    
}

function ripristinaPuntata(){
    puntataIniziale=0;
    viewPuntataIniziale();
    document.getElementById('errorePuntata').innerText="";
}

function aumentaPuntata(valore){
    puntataIniziale+=valore;
    viewPuntataIniziale();  
}

function buildDeck() {
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["cuori", "quadri", "fiori", "picche"];

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]); 
        }
    }
}

function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

async function startGame() {
    play("clickConfermaPuntata");
    nascondiAzioni(1);
    saldoIniziale=saldo;
    saldo-=puntataIniziale; 
    mostraSaldoAggiornato();
    mano1.totPuntata=puntataIniziale;

    $('#containerPuntata').hide();
    $('#containerPartita').show();
    
    await delay(1500);

    containerMano1.find('.puntataMano').text("Totale puntata: "+mano1.totPuntata);
    mano1.playerFirstHit(); //prima carta al giocatore
    await delay(intervallo);

    dealerFirstHit();  // prima carta al dealer
    await delay(intervallo);
    
    mano1.playerSecondHit();  //seconda carta al giocatore
    
    if (mano1.punteggio==21) {
        mano1.playerBlackJack=true;
        containerMano1.find('.punteggio').text("Black Jack!");
    }  
    
    await delay(intervallo);
    dealerSecondHit();  //seconda carta al dealer

    if(punteggioDealer==21){
        dealerBlackJack=true;
    }

    await delay(intervallo);
   
    checkAssoDealer();
    
    containerMano1.find('.hit').on("click", () => hit(1));
    containerMano1.find('.stay').on("click", () => stay(1));
    containerMano1.find('.raddoppia').on("click", () => raddoppia(1));
    containerMano1.find('.split').on("click", () => split(1));        
}

// Approccio non più utilizzato
function invisibleCard() {
    let tagImg = document.createElement("img");
    tagImg.src = "./cards/joker.svg";
    tagImg.classList.add('invisible');
    let tagImg2 = tagImg.cloneNode(true);
    $('#containerCarteDealer').append(tagImg);
    $('.containerMano[data-mano="1"]').find('.containerCarteGiocatore').append(tagImg2);
}

function getValue(card) {
    let data = card.split("-"); 
    let value = data[0];

    if (isNaN(value)) {
        if (value == "A") {
            return 11;
        }
        return 10;
    }
    return parseInt(value);
}

function checkAce(card) {
    if (card[0] == "A") {
        return 1;
    }
    return 0;
}

function reduceDealerAces(){
    while (punteggioDealer > 21 && dealerAceCount > 0) {
        punteggioDealer -= 10;
        dealerAceCount --;
    }
}

async function dealerFirstHit(){
        play("flipcard"); 
        let tagImg = document.createElement("img");
        dealerFirstCard = "A-quadri";
        tagImg.src = "./cards/" + dealerFirstCard + ".svg";
        punteggioDealer += getValue(dealerFirstCard);
        dealerAceCount += checkAce(dealerFirstCard);

        document.getElementById("containerCarteDealer").append(tagImg);

        $('#punteggioDealer').text(getValue(dealerFirstCard));

        reduceDealerAces();
        await delay(intervallo);
}

async function dealerSecondHit(){
    play("flipcard"); 
    let tagImg = document.createElement("img");
    tagImg.id="cartaCoperta";
    cartaCoperta=deck.pop();
    tagImg.src = "./cards/retro.svg";
    punteggioDealer += getValue(cartaCoperta);
    dealerAceCount += checkAce(cartaCoperta);
    document.getElementById("containerCarteDealer").append(tagImg);
    reduceDealerAces();
    await delay(intervallo);
}

async function dealerHit(){
        play("flipcard"); 
        let tagImg = document.createElement("img");
        let card = deck.pop();
        tagImg.src = "./cards/" + card + ".svg";
        punteggioDealer += getValue(card);
        dealerAceCount += checkAce(card);       
        document.getElementById("containerCarteDealer").append(tagImg);
        reduceDealerAces();
        document.getElementById("punteggioDealer").innerText = punteggioDealer;
        
}

function nascondiAzioni(nMano){
    const containerMano = $('.containerMano[data-mano='+nMano+']');
    containerMano.find('.azioniPartita').hide();
}

function mostraAzioni(nMano){
    console.log("sono entrato nel mostra azioni");
    let mano = mani[nMano-1];
    if(mano.punteggio==21){
        mano.playerBlackJack=true;
        stay(nMano);
    } else {
        const containerMano = $('.containerMano[data-mano='+nMano+']');

        containerMano.find('.hit').show();
        containerMano.find('.stay').show();
        checkRaddoppio(nMano);
        checkSplit(nMano);
    }       
}

function checkRaddoppio(nMano) {
    const containerMano = $('.containerMano[data-mano='+nMano+']');
    
    if(puntataIniziale>saldo){
        nascondiRaddoppia(nMano);
    }
    else {
        containerMano.find('.raddoppia').show();
    }
}

function checkSplit(nMano){
    const containerMano = $('.containerMano[data-mano='+nMano+']');
    let mano = mani[nMano-1];

    let valorePrimaCarta = getValue(mano.carteinMano[0]);
    let valoreSecondaCarta = getValue(mano.carteinMano[1]);
    
    if(valorePrimaCarta == valoreSecondaCarta && mano.totPuntata<=saldo){
        console.log(true);
        containerMano.find('.split').show();
    }
    else {
        console.log(false);
        containerMano.find('.split').hide();
    }
}

async function split(nMano){
    play("clickPuntata");

    let containerManoAttuale= $('.containerMano[data-mano='+nMano+']');

    nascondiAzioni(nMano);

    let manoAttuale = mani[nMano-1];
    saldo-=manoAttuale.totPuntata;
    mostraSaldoAggiornato();
    let nuovaMano = new Mano();
    mani.push(nuovaMano); // aggiunge la nuova mano all'elenco di mani

    containerManoAttuale.find('.playerSecondCard').remove();
    nuovaMano.carteinMano.push(manoAttuale.carteinMano.pop()); // trasferisce la carta da una mano all'altra
    nuovaMano.aceCount += checkAce(nuovaMano.carteinMano[0]);
    
    console.log(manoAttuale.carteinMano, nuovaMano.carteinMano);
    manoAttuale.punteggio = getValue(manoAttuale.carteinMano[0]); //aggiorna il punteggio della mano attuale
    nuovaMano.punteggio = getValue(nuovaMano.carteinMano[0]); // e della nuova mano
    nuovaMano.totPuntata = manoAttuale.totPuntata;
    containerManoAttuale.find('.punteggio').text(manoAttuale.punteggio); 

    // crea il nuovo contentenitore e lo aggiunge all'html
    let nuovoContainerMano = containerBianco.clone();
    nuovoContainerMano.attr('data-mano',(mani.length));
    nuovoContainerMano.find('.azioniPartita').hide();
    $('#containerMani').append(nuovoContainerMano);
    nuovoContainerMano.find('.punteggio').text(nuovaMano.punteggio);    //mostra il punteggio della nuova mano
    nuovoContainerMano.find('.puntataMano').text('Totale puntata: '+nuovaMano.totPuntata);

    //crea il tag img della carta e lo appende al div della seconda mano
    let tagImg = document.createElement("img");
    tagImg.src = "./cards/" + nuovaMano.carteinMano[0] + ".svg"; 
    nuovoContainerMano.find('.containerCarteGiocatore').append(tagImg);

    
    await delay(intervallo);

    //dà la seconda carta alla mano attuale
    splitNewCard(nMano);

    if (manoAttuale.punteggio==21) {
        manoAttuale.playerBlackJack=true;
        containerManoAttuale.find('.punteggio').text("Black Jack!");
    } 

    await delay(intervallo);

    //dà la seconda carta alla nuova mano
    splitNewCard(mani.length);

    if (nuovaMano.punteggio==21) {
        nuovaMano.playerBlackJack=true;
        nuovoContainerMano.find('.punteggio').text("Black Jack!");
    } 

    await delay(intervallo);
    mostraAzioni(nMano);

    eventListeners();  
}

function eventListeners(){
   
        for (let i = 1; i <= mani.length; i++) {
            let containerMano = $('.containerMano[data-mano=' + i + ']');
            if (containerMano.length) {
                containerMano.find('.hit').off().on("click", () => hit(i));
                containerMano.find('.stay').off().on("click", () => stay(i));
                containerMano.find('.raddoppia').off().on("click", () => raddoppia(i));
                containerMano.find('.split').off().on("click", () => split(i));
            }
        }
    
    /*  Questo vecchio approccio causava dei bug

    let containerMano1= $('.containerMano[data-mano=1]');
    let containerMano2= $('.containerMano[data-mano=2]');
    let containerMano3= $('.containerMano[data-mano=3]');
    let containerMano4= $('.containerMano[data-mano=4]');
    let containerMano5= $('.containerMano[data-mano=5]');

    if (containerMano1.length) {
        containerMano1.find('.hit').on("click", () => hit(1));
        containerMano1.find('.stay').on("click", () => stay(1));
        containerMano1.find('.raddoppia').on("click", () => raddoppia(1));
        containerMano1.find('.split').on("click", () => split(1));
    }

    if (containerMano2.length) {
        containerMano2.find('.hit').on("click", () => hit(2));
        containerMano2.find('.stay').on("click", () => stay(2));
        containerMano2.find('.raddoppia').on("click", () => raddoppia(2));
        containerMano2.find('.split').on("click", () => split(2));
    }

    if (containerMano3.length) {
        containerMano3.find('.hit').on("click", () => hit(3));
        containerMano3.find('.stay').on("click", () => stay(3));
        containerMano3.find('.raddoppia').on("click", () => raddoppia(3));
        containerMano3.find('.split').on("click", () => split(3));
    }

    if (containerMano4.length) {
        containerMano4.find('.hit').on("click", () => hit(4));
        containerMano4.find('.stay').on("click", () => stay(4));
        containerMano4.find('.raddoppia').on("click", () => raddoppia(4));
        containerMano4.find('.split').on("click", () => split(4));
    }

    if (containerMano5.length) {
        containerMano5.find('.hit').on("click", () => hit(5));
        containerMano5.find('.stay').on("click", () => stay(5));
        containerMano5.find('.raddoppia').on("click", () => raddoppia(5));
        containerMano5.find('.split').on("click", () => split(5));
    } */
    
}

function splitNewCard(nMano){
    play('flipcard');
    let mano = mani[nMano-1];
    let containerMano = $('.containerMano[data-mano='+nMano+']');

    let tagImg = document.createElement("img");
    tagImg.classList.add('playerSecondCard');
    let card = deck.pop();
    tagImg.src = "./cards/" + card + ".svg";
    mano.carteinMano.push(card);
    console.log(mano.carteinMano);
    mano.punteggio += getValue(card);
    mano.aceCount += checkAce(card);
    containerMano.find('.containerCarteGiocatore').append(tagImg);
    
    mano.reducePlayerAces();
    
    containerMano.find('.punteggio').text(mano.punteggio); 
}
