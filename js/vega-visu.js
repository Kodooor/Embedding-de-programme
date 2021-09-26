let selectedSubmissions = [];
let vega_view = undefined;
const tags = [
    {
        date: '2020-03-12 07:48:50',
        name: '> au lieu de >=', 
        user: "samir_toularhmine", 
        id: 0, 
        exercise: "70ae7ad6cf504e0fa8cedebd8e8a825f", 
        exercise_name: "semestreValide", 
        embeddingX: "75.57536", 
        embeddingY: "-5.447176",
        attemptIDs : [0],
    },
    {
        date: '2020-03-12 07:48:50',
        name: 'un tag', 
        user: "ionas", 
        id: 1, 
        exercise: "709a3600dc12d686d1c8f691a0af1e19", 
        exercise_name: "jourNuit", 
        embeddingX: "0", 
        embeddingY: "0",
        attemptIDs : [2169],
    },
]

// Fonction permettant de charger le fichier JSON
async function getJSON () {
    // Mettre un lien vers la ressource sur le serveur.
    const res = await fetch('../res/NewCaledonia_5690_light.json');
    const json = await res.json();

    return json;
}

// Fonction permettant de récupérer tous les exercices disponibles ainsi que leur nom.
function getData(json){
    const exercices = [''];
    const exerciceNames = ['Tous'];
    const users = [''];
    const coords = {};

    for (const s of json) {
        coords[s.attemptID] = s;
        if (exercices.indexOf(s.exercise) === -1) {
            exercices.push(s.exercise);
            exerciceNames.push(s.exercise_name);
        }
        if(users.indexOf(s.user) === -1){
            users.push(s.user);
        }
    }

    return [exercices, exerciceNames, users, coords];
}

function nbSoumissions(json){
    const nombre = [];
    for (const s of json) {
      if(nombre.length < 10)
          nombre.push(nombre.length + 1);
    }
    return nombre;
}


let v = undefined;
let exercices = undefined;
let exerciceNames = undefined;
let users = undefined;
let coords = undefined;
let data = undefined;
let radius = 0;
let listeGroupes = undefined;
let current_programs = [];

getJSON().then(datas => {
    data = datas;
    v = getData(datas);
    exercices = v[0];
    exerciceNames = v[1];
    users = v[2];
    coords = v[3];
    listeGroupes = getSoumissionsParGroupe(data);
    current_programs = data;
    main();
});

// Fonction permettant de récupérer les x dernieres soumissions triées de la plus ancienne à
// la plus récente
function getxSoumissions(json, x, user, exercice) {
    const soumissions = [{}];
    let nbsoum = 0;
    let indice = 0;
    json.sort(custom_sort);
    for(const j of json){
        if(j.user == user && nbsoum < x && j.exercise == exercice){
            soumissions[indice] = j;
            indice++;
            nbsoum++;
        }

    }
    return soumissions
}

// Fonction permettant de récupérer tous les programmes d'un étudiant pour un exercice
// triés de la plus ancienne à la plus récente
function getSoumissionsParEtudiant(json, etudiant, exerciceName) {
    const soumissions = [];
    const soumissionsFinal = [];

    let datetime = '';
    let code = "";
    json.sort(custom_sort);
    for (const s of json) {
        if (s.user == etudiant && s.exercise_name == exerciceName) {
            soumissions.push(s.date);
            soumissions.push(s.upload);
        }
    }

    return soumissions;
}

const getEtudiantsParExercices = (json, exercice) => {

    const users = [''];

    for (const s of json) {
        if (s.exercise == exercice && users.indexOf(s.user) === -1 && exercice != ''){
          users.push(s.user);
        }
        else if (exercice == '' && users.indexOf(s.user) === -1){
          users.push(s.user);
        }
    }
    return users;
  }

// Fonction permettant de récupérer tous les étudiants pour un groupe
const getSoumissionsParGroupe = (json) => {
    const soumissions = [''];

    for (const s of json) {
        if (s.groupe && soumissions.indexOf(s.groupe) === -1) {
            soumissions.push(s.groupe);
        }
    }

    return soumissions;
}

function cleancode(code){
    return code.replaceAll('&', '&#38;').replaceAll(' ', '&#160;').replaceAll('<', '&#60;').replaceAll('>', '&#62;').replaceAll('\n', '<br/>').replaceAll('"', '&#34;').replaceAll('\'', '&#39;');
}

function clearSubmissions() {
    for(let i = 0; i < selectedSubmissions.length ; i++){
        document.getElementById('submission-' + selectedSubmissions[i].attemptID).remove();
    }
    selectedSubmissions = [];
    document.getElementById('vider-button').disabled = true;
}

function ajouterTag(nomEnseignant, x, y, tag){
    if(tags.filter(t => parseFloat(t.embeddingX) == parseFloat(x) && parseFloat(t.embeddingY) == parseFloat(y)).length == 0){
        tags.push({nomEnseignant, x, y, tag})
    }
}


function supprimer(e){
    const attemptID = parseInt( e.parentNode.parentNode.id.split('-')[1]);
    const theSubmission = selectedSubmissions.filter(s => s.attemptID === attemptID);
    document.getElementById('submission-' + theSubmission[0].attemptID).remove();
    selectedSubmissions = selectedSubmissions.filter(s => s.attemptID !== attemptID);
}

    
function calculerCoordonneesTag(tag, coords)  {
    let xtotal = 0;
    let ytotal = 0;
    tag.attemptIDs.forEach(id => {

        xtotal += parseFloat(coords[id].embeddingX);
        ytotal += parseFloat(coords[id].embeddingY);
    });
    tag.embeddingX = (xtotal / tag.attemptIDs.length).toString();
    tag.embeddingY = (ytotal / tag.attemptIDs.length).toString();


}

// Pas fou mais j'ai pas trouvé comment faire autrement
function addSubmissionsInRange(){
    const selectValue = document.getElementsByName('tagSelectParam')[0].value;
    const rangeValue = document.getElementsByName('radiusParam')[0].value;
    const tag = tags[parseInt(selectValue)];
    if(tag !== undefined){
        if(rangeValue == 0){
            clearSubmissions();
        }else{
            for(let p in coords){
                if(Math.pow(coords[p].embeddingX - tag.embeddingX, 2) + Math.pow(coords[p].embeddingY - tag.embeddingY, 2) <= Math.pow(rangeValue,2)){
                    addSubmission(coords[p]);
                }
            }
        }
    }
}

function addToSelectedSubmissions(){
    const selectValue = document.getElementsByName('tagSelectParam')[0].value;

    document.getElementsByName('radiusParam')[0].disabled = selectValue === ""

    const tag = tags[parseInt(selectValue)];
    if(tag !== undefined){
        tag.attemptIDs.forEach(id => {
            addSubmission(coords[id]);
        });
    }else{
        clearSubmissions();
    }
}

function tagger(tagName, attemptID){
    const submissions = selectedSubmissions.filter(s => {
        return s.attemptID === attemptID}
        );
    if(submissions.length > 0 && vega_view){
        const submission = submissions[0];        
        if(tagName.trim() !== ''){
            if(tags.filter(t => t.exercise == submission.exercise && t.name == tagName).length == 0){
                let maxId = 0;
                tags.forEach(t => {
                    if(t.id > maxId){
                        maxId = t.id;
                    }
                })
                maxId++;

                tags.push( 
                    {
                        date: '2020-03-12 07:48:50',
                        name: tagName, 
                        user: "samir_toularhmine", 
                        id: maxId, 
                        exercise: submission.exercise, 
                        exercise_name: submission.exercise_name, 
                        embeddingX: submission.embeddingX, 
                        embeddingY: submission.embeddingY,
                        attemptIDs : [submission.attemptID]
                    },
                );
                calculerCoordonneesTag(tags[tags.length - 1], coords)
                majTableauTag(attemptID);
                majOptionsTag(attemptID);

                document.getElementById('inputAjoutTag').value = '';
                vega_view.change('tags', vega.changeset().insert(tags)).run();
                
            }
        }        
    }else{
        console.error('/!\\ Une erreur est survenue dans la récupération du point dans le plan.');
    }
}



function ajouterTagExistant(idTag, attemptID){

    const leTag = tags.filter(s => s.id == idTag)[0];



    leTag.attemptIDs.push(attemptID);

    calculerCoordonneesTag(leTag, coords)

    majOptionsTag(attemptID);    
    majTableauTag(attemptID);

    vega_view.change('tags', vega.changeset().remove(vega_view.data('tags'))).run();
    vega_view.change('tags', vega.changeset().insert(tags)).run();

    
}


function focusSelectionEtudiant(nomEtudiant){
    const ssp = document.getElementsByName('studentSelectParam').item(0);
    ssp.value = nomEtudiant
}

// Fonction permettant de gérer les soumissions sélectionnées avec ctrl
function addSubmission(item) {
    if(item.upload){
        if(!selectedSubmissions.includes(item)){
            selectedSubmissions.push(item);
            const newElement = document.createElement('div');
            newElement.className = 'submission';
            newElement.id = 'submission-' + item.attemptID
            newElement.innerHTML = '<p> <pre class="prettyprint linenums lang-py"> ' + cleancode(item.upload) + '</pre>'  + '</p><p class="bottom-selection"><button input="button" class="btn btn-primary" onClick="gestionnaire(this)">Gérer les tags</button> <button class="btn btn-danger" onClick="supprimer(this)">Supprimer de la sélection</button></p>'
            document.getElementById('soumissions').appendChild(newElement);    
            PR.prettyPrint();
            document.getElementById('vider-button').disabled = false;
        }
    }
}

function disableSelect(){
    document.getElementById('selectAjoutTag').disabled = true;
    document.getElementById('boutonAjoutTag').disabled = true;
}

function enableSelect(){
    document.getElementById('selectAjoutTag').disabled = false;
    document.getElementById('boutonAjoutTag').disabled = false;
}

function supprimerTag(idTag, idProgramme){
    const leTag = tags.filter(s => s.id == idTag)[0];
    const index = leTag.attemptIDs.indexOf(idProgramme);
    leTag.attemptIDs.splice(index, 1);
    majOptionsTag(idProgramme);
    majTableauTag(idProgramme);
    calculerCoordonneesTag(leTag, coords)

    vega_view.change('tags', vega.changeset().remove(vega_view.data('tags'))).run();
    vega_view.change('tags', vega.changeset().insert(tags)).run();
}


function gestionnaire(e){

    const attemptID = parseInt( e.parentNode.parentNode.id.split('-')[1]);
    document.getElementById("gestionnaireTitle").innerHTML = 'Gestion des tags pour le programme n°' + attemptID;
    
    majTableauTag(attemptID);
    majOptionsTag(attemptID);

    const boutonAjoutTag = document.getElementById('boutonAjoutTag')
    const selectAjoutTag = document.getElementById('selectAjoutTag')

    boutonAjoutTag.onclick = () => ajouterTagExistant(selectAjoutTag.value, attemptID)

    const inputAjoutTag = document.getElementById('inputAjoutTag')
    const buttonCreerTag = document.getElementById('buttonCreerTag')

    buttonCreerTag.onclick = () => tagger(inputAjoutTag.value, attemptID);

    $('#gestionnaire').modal()
}

function majTableauTag(attemptID){
    const sesTags = {}
    tags.forEach(tag => {
        for (let i = 0; i < tag.attemptIDs.length; i++) {
            if( attemptID == tag.attemptIDs[i]){
                sesTags[tag.id] = tag;
                break;
            }
        }
    });
    const tableBody = document.getElementById("table-body")
    tableBody.innerHTML = '';

    
    for (const idTag in sesTags) {
        unTag = sesTags[idTag];
        const newRow = document.createElement('tr')
        newRow.id = 'untag-' + idTag;
        const premierColonne = document.createElement('th');
        premierColonne.scope = 'row';
        premierColonne.innerHTML = idTag;

        const deuxiemeColonne = document.createElement('td');
        deuxiemeColonne.innerHTML = unTag.name;

        const actionColonne = document.createElement('td');
        const boutonSupprimer = document.createElement('button')
        boutonSupprimer.className = 'btn btn-danger'
        boutonSupprimer.onclick = () => supprimerTag(idTag, attemptID);
        boutonSupprimer.innerHTML = 'Supprimer'
        actionColonne.appendChild(boutonSupprimer);

    
        newRow.appendChild(premierColonne);
        newRow.appendChild(deuxiemeColonne);
        newRow.appendChild(actionColonne);


        tableBody.appendChild(newRow);
    }

}

function majOptionsTag(attemptID){
    const selectAjoutTag = document.getElementById('selectAjoutTag');
    selectAjoutTag.innerHTML = '';
    let added = false;

    const point = data.filter(s => s.attemptID === attemptID)[0];
    tags.forEach(tag => {
        if(tag.exercise == point.exercise && tag.attemptIDs.indexOf(attemptID) == -1){
            const option = document.createElement('option');
            option.value = tag.id;
            option.innerHTML = tag.name;
            selectAjoutTag.appendChild(option);
            added = true
        }
    });
    added ? enableSelect() : disableSelect();
}

function custom_sort(a, b) {
    return new Date(a.date).getTime() < new Date(b.date).getTime();
}

async function main() {
    // Fonction permettatn de récupérer tous les utilisateurs

    const initStyles = () => {
        // Style des checkboxes
        const sip = document.getElementsByName('showIncorrectParam').item(0);
        const scp = document.getElementsByName('showCorrectParam').item(0);
        const tmp = document.getElementsByName('trajectoryModeParam').item(0);

        sip.className = 'form-check-input';
        scp.className = 'form-check-input';
        tmp.className = 'form-check-input';

        // Style des inputs texts
        const ssearchp = document.getElementsByName('studentSearchParam').item(0);
        const psearchp = document.getElementsByName('patternSearchParam').item(0);
        ssearchp.className = 'form-control';
        psearchp.className = 'form-control';

        // Style des selects
        const ep = document.getElementsByName('exerciseParam').item(0);
        const ssp = document.getElementsByName('studentSelectParam').item(0);
        const tsp = document.getElementsByName('tagSelectParam').item(0);
        const gsp = document.getElementsByName('groupeSearchBar').item(0);
        ep.className = 'form-control';
        ssp.className = 'form-control';
        tsp.className = 'form-control';
        gsp.className = 'form-control';

        // Style des input range
        const rp = document.getElementsByName('radiusParam').item(0);
        const ndsp = document.getElementsByName('nbDerniersSoumissionsParam').item(0);
        rp.className = 'form-range';
        rp.disabled = true; 
        
        ndsp.className = 'form-range';
    }

    function parseDate(date){
        const dateSplitted = date.split(' ');
        const heure = dateSplitted[1];
        const jour = dateSplitted[0].split('-')[2];
        const mois = dateSplitted[0].split('-')[1];
        const annee = dateSplitted[0].split('-')[0];

        return 'Le ' + jour + '/' + mois + '/' + annee + ' à ' + heure;
    }

    // Fonction permettant de récupérer tous les programmes d'un étudiant pour un exercice
    const getSoumissionsParEtudiant = (json, etudiant, exerciceName) => {
        const soumissions = {};
        const date = {}
        

        for (const s of json) {
            if (s.user == etudiant && s.exercise_name == exerciceName) {
                soumissions[s.attemptID] = s.upload;
                date[s.attemptID] = s.date;

                //soumissions.push(s.date);
                //soumissions.push(s.upload);
            }
        }

        return [soumissions, date];
    }

    const graphe = {
        width: 800,
        height: 600,
        title: 'Visualisation des soumissions d\'étudiants',
        transform: [
            {
                filter: {
                    param: 'intervalTimeParam'
                }
            },
        ],
        layer: [
            {
                transform: [
                    {
                        filter: {
                            or: [
                                {
                                    field: 'exercise',
                                    equal: {
                                        expr: 'exerciseParam'
                                    }
                                },
                                {
                                    not: {
                                        param: 'exerciseParam',
                                        equal: ''
                                    }
                                },
                            ]
                        }, 
                    }
                ],
                data: {
                    name: 'tags',
                    values: tags,
                },
                mark: {
                    type: 'text',
                },
                encoding: {
                    text: {
                        field: 'name',
                    },
                    x: {
                        field: 'embeddingX',
                        type: 'quantitative',
                        axis: {
                            grid: false
                        },
                        scale: {
                            domain: [-100, 100]
                        },
                    },
                    y: {
                        field: 'embeddingY',
                        type: 'quantitative',
                        axis: {
                            grid: false
                        },
                        scale: {
                            domain: [-100, 100]
                        },
                    },
                    color: {
                        value: 'purple'
                    },
                    tooltip: [
                        {field: 'name', type: 'nominal'},
                        {field: 'user', type: 'nominal'},
                        {field: 'date', type: 'nominal', formatType: 'time'},
                        {field: 'exercise_name', type: 'nominal'},
                    ],
                }
            },
            {
                mark: {
                    type: 'trail',
                },
                transform: [
                    {
                        filter: {
                            and: [
                                {
                                    or: [
                                        {
                                            field: 'user',
                                            equal: {
                                                expr: 'studentSearchParam'
                                            }
                                        },
                                        {
                                            field: 'user',
                                            equal: {
                                                expr: 'studentSelectParam'
                                            }
                                        },
                                        {
                                            param: "oneStudentSelectionParam",
                                            empty: false,
                                        },
                                    ]
                                },
                                {
                                    param: "trajectoryModeParam"
                                },
                            ]
                        }, 
                    }
                ],
                encoding: {
                    x: {
                        field: 'embeddingX',
                        title: 'X',
                        type: 'quantitative',
                        axis: {
                            grid: false
                        },
                        scale: {
                            domain: [-100, 100]
                        },
                        sort: {
                            field: "attemptID",
                        },
                    },
                    y: {
                        field: 'embeddingY',
                        title: 'Y',
                        type: 'quantitative',
                        axis: {
                            grid: false
                        },
                        scale: {
                            domain: [-100, 100]
                        },
                        
                        sort: {
                            field: "attemptID",
                        },
                    },
                    size: {
                        field: "attemptID",
                        scale: {
                            type: "linear", 
                            rangeMin: 1,
                            rangeMax: 3
                        },
                    }
                }
            },
            {
                params: [
                    {
                        name: 'grid',
                        select: {
                            type: 'interval'
                        },
                        bind: 'scales',
                    },
                    {
                        name: 'oneStudentSelectionParam',
                        select: {
                            type: "point",
                            fields: ['user'],
                            resolve: 'global',
                            on: {
                                type: 'mousedown',
                                filter: ["event.shiftKey", "event.button === 0"]
                            },
                            clear: {
                                source: 'window',
                                type: 'keydown',
                                filter: ['event.keyCode === 67'], // A définir en aval.
                            },
                        },
                    },
                ],
                mark: {
                    type: 'point',
                    filled: true,
                },
                encoding: {
                    x: {
                        field: 'embeddingX',
                        type: 'quantitative',
                        axis: {
                            grid: false
                        },
                        scale: {
                            domain: [-100, 100]
                        },
                    },
                    y: {
                        field: 'embeddingY',
                        type: 'quantitative',
                        axis: {
                            grid: false
                        },
                        scale: {
                            domain: [-100, 100]
                        }
                    },
                    order: {"field": "attemptID"},
                    color: {
                        type: 'nominal',
                        condition: [
                            {
                                test: {
                                    field: 'correct',
                                    equal: '0'
                                },
                                value: 'red'
                            },
                            {
                                test: {
                                    field: 'correct',
                                    equal: '1'
                                },
                                value: 'green'
                            },
                        ]
                    },
                    opacity : {
                        value: 1
                    }, 
                    tooltip: [
                      {field: 'exercise_name', type: 'nominal'},
                      {field: 'user', type: 'nominal'},
                      {field: 'date', type: 'nominal', formatType: 'time'},
                      {field: 'attemptID', type: 'nominal'},
                    ],
                },
            },
        ],
    }

    const timeline = {
        width : 800,
        height : 100,
        mark: { 
            type: 'area', 
            line : {
                color: 'blue'
            },
            point: {
                filled: false,
                color: 'blue',
                fill: 'white'
            } ,
            color : {
                x1: 1,
                y1: 1,
                x2: 1,
                y2: 0,
                gradient: 'linear',
                stops: [
                {
                    offset: 0,
                    color: 'white'
                },
                {
                    offset: 1,
                    color: 'blue'
                }
                ]
            }
        },
        params: [
            {
                name: 'brush',
                select: {type: 'interval',
                on: '[mousedown, mouseup] > mousemove',
                translate: '[mousedown[event.ctrlKey], mouseup] > mousemove!',

            },
                bind: 'scales'
            },
            {
                name: 'intervalTimeParam',
                select: {
                    type: 'interval',
                    encodings: ['x'],

                    on: '[mousedown[!event.ctrlKey], mouseup] > mousemove',
                    translate: '[mousedown[!event.ctrlKey], mouseup] > mousemove!',
                },
            },
        ],


        encoding: {
            
            x: {
                field: 'date',
                type: 'temporal',
                title: 'date',
                bin: {
                    maxbins: 40,
                    extent: {
                      selection: 'brush',
                    },
                },
                axis: {
                    format: '%Y-%m-%d %H:%m',
                    labelAngle: -45,
                    labelOverlap: false,
                }
            },
            y: {
                title: 'Nombre de soumissions',
                aggregate: 'count',
                type: 'quantitative',
                axis: {
                    grid: false
                },

            },
        }
    }

    const spec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        data: {
            name: 'programs',
            values: data
        },
        params: [
            {
                name: "studentSearchParam",
                bind: {
                    input: 'text',
                    name: "Rechercher un étudiant",
                    element: ".student-search-bar",
                    placeholder: '2170664'
                },
                value : ''
            },
            {
                name: "groupeSearchBar",
                bind: {
                    input: 'select',
                    name: "Filtre par groupe",
                    element: ".groupes",
                    options: listeGroupes,
                },
                value : listeGroupes[0]
            },
            {
                name: "studentSelectParam",
                bind: {
                    input: 'select',
                    name: "Sélectionner un étudiant",
                    element: ".student-select",
                    options: users,
                },
                value : users[0]
            },
            {
                name: "showCorrectParam",
                bind: {
                    input: 'checkbox',
                    name: 'Afficher les soumissions correctes ',
                    element: '.correct-submissions'
                },
                value: true
            },
            {
                name: "showIncorrectParam",
                bind: {
                    input: 'checkbox',
                    name: "Afficher les soumissions incorrectes ",
                    element: ".incorrect-submissions",
                },
                value: true
            },
            {
                name: "exerciseParam",
                bind: {
                    input: 'select',
                    name: 'Exercice ',
                    element: ".exercices",
                    options: exercices,
                    labels: exerciceNames,
                },
                value: exercices[0]
            },
            {
                name: "nbDerniersSoumissionsParam",
                bind: {
                    input: 'range',
                    name: 'Nombre de soumissions voulues ',
                    element: ".nbDerniersSoumissions",
                    min: 1,
                    max: 10,
                    step: 1,
                },
                value: 5
            },
            {
                name: "trajectoryModeParam",
                bind: {
                    input: 'checkbox',
                    name: "Mode trajectoire",
                    element: ".trajectory-mode",
                },
                value: true
            },
            {
                name: "patternSearchParam",
                bind: {
                    input: 'text',
                    name: "Contient le motif",
                    element: ".pattern-search-bar",
                    placeholder: 'def(n): prin..'
                },
                value : ''
            },
            {
                name: "tagSelectParam",
                bind: {
                    input: 'select',
                    name: 'Tag ',
                    element: ".tag-select",
                    options: [''].concat(tags.map(t => (t.id).toString())),
                    labels: ['Aucun'].concat(tags.map(t => t.name)),
                },
                value: ''
            },
            {
                name: "radiusParam",
                bind: {
                    input: 'range',
                    name: 'Radius d\'inclusion de programme ',
                    element: ".tag-range",
                    min: 0,
                    max: 200
                },
                value: 0,
            },
        ],
        transform: [
            {
            filter: {
                and: [
                    {
                        or: [
                            {
                                not: {
                                    param: 'tagSelectParam',
                                    equal: ''
                                }
                            },
                            {
                                or: [
                                    "indexof(data('tags')[tagSelectParam].attemptIDs, datum.attemptID) >= 0",
                                    "pow(datum.embeddingX - data('tags')[tagSelectParam].embeddingX, 2) + pow(datum.embeddingY - data('tags')[tagSelectParam].embeddingY, 2) < pow(radiusParam,2)"
                                ]
                            }
                        ]
                    },
                    {
                        or: [
                            "test(patternSearchParam, datum.upload)",
                            {
                                not: {
                                    param: 'patternSearchParam',
                                    equal: ''
                                }
                            }
                        ]
                    },
                    {
                        param: "oneStudentSelectionParam",
                        empty: true,
                    },
                    {
                        or: [
                            {
                                field: 'groupe',
                                equal: {
                                    expr: 'groupeSearchBar'
                                }
                            },
                            {
                                not: {
                                    param: 'groupeSearchBar',
                                    equal: ''
                                }
                            }
                        ]
                    },
                    {
                    or: [
                        {
                            field: 'exercise',
                            equal: {
                                expr: 'exerciseParam'
                            }
                        },
                        {
                            not: {
                                param: 'exerciseParam',
                                equal: ''
                            }
                        }
                    ]
                    },
                    {
                        or: [{
                                and: [{
                                        field: 'correct',
                                        equal: '1'
                                    },
                                    {
                                        param: 'showCorrectParam',
                                    },
                                ]
                            },
                            {
                                and: [{
                                        field: 'correct',
                                        equal: '0'
                                    },
                                    {
                                        param: 'showIncorrectParam',
                                    },

                                ]
                            },
                        ]
                    },
                    {
                        or: [{
                                field: 'user',
                                equal: {
                                    expr: 'studentSearchParam'
                                }
                            },
                            {
                                not: {
                                    param: 'studentSearchParam',
                                    equal: ''
                                }
                            }
                        ]
                    },
                    {
                        or: [
                            {
                                field: 'user',
                                equal: {
                                    expr: 'studentSelectParam'
                                }
                            },
                            {
                                not: {
                                    param: 'studentSelectParam',
                                    equal: ''
                                }
                            }
                        ]
                    }
                ]
            }
        }],
        vconcat: [graphe, timeline]
    
    };

    const defineEventListeners = (view) => {
        view.addEventListener('mouseover', function(event, item) {
            if(item != null && item.tooltip && !item.datum.name && document.getElementById('submission-' + item.datum.attemptID) != null) {
                document.getElementById('submission-' + item.datum.attemptID).className = 'submission hovered'
            }
        });

        view.addEventListener('mouseout', function(event, item) {
            if(item != null && item.tooltip && !item.datum.name && document.getElementById('submission-' + item.datum.attemptID) != null) {
                document.getElementById('submission-' + item.datum.attemptID).className = 'submission'
            }
        });

        document.getElementById('exo').addEventListener('change', function(){

            spec.data.values = data;

            let e = document.getElementsByName("exerciseParam")[0];
     
            let v = getEtudiantsParExercices(data, e.value);

            let lesUtilisitaurs = document.getElementsByName("studentSelectParam")[0];

            
            lesUtilisitaurs.childNodes.forEach(node => {
                node.style = '';
                if(!v.includes(node.value))
                    node.style = 'display:none';
            })
            

        });
     
        document.getElementById('dernSoumissions').addEventListener('change', function(){
     
            let nbSoum = document.getElementsByName("nbDerniersSoumissionsParam")[0].value;
            let x = nbSoum;
            let e = document.getElementsByName("exerciseParam")[0].value;
            const exerciceChoisi = e;
        
            let etudiant = document.getElementsByName("studentSelectParam")[0].value;
        
            let soumettre = getxSoumissions(data, nbSoum, etudiant, exerciceChoisi);

            vega_view.change('programs', vega.changeset().remove(vega_view.data('programs')).insert(soumettre)).runAsync();

            current_programs = soumettre;
        });

        document.getElementById('etudiant').addEventListener('change', function(){
            let e = document.getElementsByName("exerciseParam")[0].value;
            const exerciceChoisi = e;
        
            let etudiant = document.getElementsByName("studentSelectParam")[0].value;
            
            if(e != '' && etudiant != ''){
                document.getElementsByName('nbDerniersSoumissionsParam').item(0).disabled = false;
            }

            let nbSoum = document.getElementsByName("nbDerniersSoumissionsParam")[0].value;

            let soumettre = getxSoumissions(data, nbSoum, etudiant, exerciceChoisi);
 
            if(etudiant == ''){
                soumettre = data;
            }

            vega_view.change('programs', vega.changeset().remove(current_programs).insert(soumettre)).runAsync();

            current_programs = soumettre;

           /* spec.params[2].value = etudiant;
            spec.params[6].value = 5;
            spec.params[5].value = getExerciceParEtudiant();
      
            console.log(spec.params);

            vegaEmbed('#visu', spec, false).then(result => {
                defineEventListeners(result.view)
                vega_view = result.view;
                initStyles();
            });*/
          });
         
        view.addEventListener('click', function(event, item) {
            if(!event.shiftKey && !event.ctrlKey && item != null && item.tooltip && !item.datum.name) {
                const res = getSoumissionsParEtudiant(data, item.datum.user, item.datum.exercise_name);
                const soummissions = res[0]
                const lesDates = res[1]
                document.getElementById("body-modal").innerHTML = '';
                
                const orderedIds = Object.keys(soummissions).map(e => parseInt(e));
                orderedIds.sort((a,b) => {
                    return new Date(lesDates[b]).getTime() - new Date(lesDates[a]).getTime();
                });

                for (const id of orderedIds) {
                    const date = parseDate(lesDates[id]);
                    const uneSoumission = cleancode(soummissions[id]) + '<br/>';
                    const newElement = document.createElement('div');
                    const titre = document.createElement('h4')
                    titre.className = 'card-title'
                    titre.innerHTML = date
                    newElement.appendChild(titre)
                    const cardText = document.createElement('p')
                    cardText.className = 'card-text'
                    cardText.innerHTML = '<pre class="prettyprint linenums lang-py"> ' + uneSoumission + '</pre>';
                    newElement.appendChild(cardText);
                    if(id == item.datum.attemptID){
                        newElement.id = 'chosenOne'
                        newElement.className = 'card hovered'
                    }else{
                        newElement.className = 'card'

                    }
                    document.getElementById("body-modal").appendChild(newElement)
                }

                PR.prettyPrint();

                const scrollToChosenOne = () => {
                    document.getElementById('chosenOne').scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                        inline: "nearest"
                    });
                }
                
                document.getElementById("exampleModalLongTitle").innerHTML = '<span> '+item.datum.user + ' | ' + item.datum.exercise_name  + '</span> <button type="button" id="go-to-code" class="btn btn-primary smooth-goto">Voir code</button>'
                document.getElementById('go-to-code').onclick = scrollToChosenOne;

                $('#exampleModalLong').on('shown.bs.modal', function (e) {
                   scrollToChosenOne();
                })

                $('#exampleModalLong').modal();
            }
            if(event.ctrlKey){
                addSubmission(item.datum);
            }
            if(event.shiftKey && item != null && item.tooltip && !item.datum.name){
                focusSelectionEtudiant(item.datum.user);
            }
        });
    }
    tags.forEach(tag => {
        calculerCoordonneesTag(tag, coords)

    })

    const result = await vegaEmbed('#visu', spec, false);
    defineEventListeners(result.view);
    vega_view = result.view;

    initStyles();

    document.getElementsByName('nbDerniersSoumissionsParam').item(0).disabled = true;
}
