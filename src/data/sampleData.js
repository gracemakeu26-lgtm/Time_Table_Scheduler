export const facultiesData = {
  faculties: [
    {
      id: 1,
      name: "Faculty of Arts",
      code: "ARTS",
      description: "Art History, Visual Arts et Performing Arts",
      departments: [
        { 
          id: 101, 
          name: "Art History", 
          programs: ["Licence Art History", "Master of Museology", "Doctorate in Arts and Archaeology"] 
        },
        { 
          id: 102, 
          name: "Visual Arts", 
          programs: ["Licence Visual Arts", "Master of Design", "Master of Painting and Sculpture"] 
        },
        { 
          id: 103, 
          name: "Performing Arts", 
          programs: ["Bachelor of Theater", "Bachelor of Cinema", "Bachelor of Music", "Master of Directing"] 
        }
      ]
    },
    {
      id: 2,
      name: "Faculty of Letters and Human Sciences",
      code: "FALSH", 
      description: "Langues, Littérature, Psychology et Social Sciences",
      departments: [
        { 
          id: 201, 
          name: "Anglais", 
          programs: ["Licence Anglais", "Master of Translation", "Master of English Linguistics"] 
        },
        { 
          id: 202, 
          name: "Français", 
          programs: ["Licence Français", "Master of French Literature", "Master of Linguistics"] 
        },
        { 
          id: 203, 
          name: "Psychology", 
          programs: ["Licence Psychology", "Master Psychology Clinique", "Master of Neuropsychology"] 
        },
        { 
          id: 204, 
          name: "Social Sciences", 
          programs: ["Bachelor of Sociology", "Master of Anthropology", "Master of Social Research"] 
        }
      ]
    },
    {
      id: 3,
      name: "Faculty of Sciences",
      code: "FS",
      description: "Biosciences, Chemistry, Computer Science, Mathematics et Physics",
      departments: [
        { 
          id: 301, 
          name: "Computer Science", 
          programs: ["Licence Computer Science", "Master of Artificial Intelligence", "Master of Networks and Security"] 
        },
        { 
          id: 302, 
          name: "Mathematics", 
          programs: ["Licence Mathematics", "Master of Statistics", "Master Mathematics Appliquées"] 
        },
        { 
          id: 303, 
          name: "Physics", 
          programs: ["Licence Physics", "Master of Astrophysics", "Master Physics Quantique"] 
        },
        { 
          id: 304, 
          name: "Chemistry", 
          programs: ["Licence Chemistry", "Master of Biochemistry", "Master Chemistry Analytique"] 
        },
        { 
          id: 305, 
          name: "Biosciences", 
          programs: ["Bachelor of Biology", "Master of Genetics", "Master of Molecular Biology"] 
        }
      ]
    },
    {
      id: 4,
      name: "Faculty of Education Sciences", 
      code: "FSE",
      description: "Sociologie, Psychology et Technologys de l'Éducation",
      departments: [
        { 
          id: 401, 
          name: "Education Sciences", 
          programs: ["Licence Education Sciences", "Master of Pedagogy", "Doctorate in Education"] 
        },
        { 
          id: 402, 
          name: "ICT and Education", 
          programs: ["Bachelor of ICT", "Master of e-Learning", "Master Technologys Éducatives"] 
        }
      ]
    },
    {
      id: 5,
      name: "Faculty of Medicine and Biomedical Sciences",
      code: "FMSB",
      description: "Médecine, Recherche Biomédicale et Santé Publique",
      departments: [
        { 
          id: 501, 
          name: "General Medicine", 
          programs: ["Doctorat en Médecine", "Spécialisation Chirurgie", "Spécialisation Pédiatrie"] 
        },
        { 
          id: 502, 
          name: "Sciences Biomédicales", 
          programs: ["Master Biomédecine", "Doctorat Recherche Biomédicale", "Master Santé Publique"] 
        }
      ]
    }
  ]
}