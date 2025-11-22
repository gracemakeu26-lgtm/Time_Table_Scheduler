import React from 'react'
import { Link } from 'react-router-dom'

// Composant de l'en-tête (HeaderPastel) corrigé pour l'espacement et la navigation
const HeaderPastel = ({ currentPath }) => (
    <div className="bg-gray-200 py-4 px-6 md:px-12 rounded-t-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <img src="logo.jpg" alt="Logo" />
            {/* Logo et Nom de l'Université (Utilisation de flex-grow pour l'alignement) */}
            <div className="flex items-center space-x-4 flex-grow">
                <div className="w-12 h-12 bg-white rounded-full border border-gray-300">
                    {/* Placeholder pour le logo */}
                </div>
                <span className="text-gray-700 font-semibold text-sm hidden sm:block">Université de Yaoundé I</span>
            </div>
            
            {/* Navigation Générale (Accueil & Emploi du temps & Connexion Admin) */}
            {currentPath !== '/login' && (
                <nav className="flex text-gray-700 font-medium ml-auto"> 
                    <Link to="/" className="hover:text-blue-600 transition-colors mr-10">Accueil</Link> 
                    <Link to="/student" className="hover:text-blue-600 transition-colors mr-10">Emploi du temps</Link>
                    <Link to="/login" className="hover:text-blue-600 transition-colors">Connexion Admin</Link>
                </nav>
            )}
            
            {/* Navigation simplifiée (uniquement Accueil pour Login) */}
            {currentPath === '/login' && (
                 <nav className="flex text-gray-700 font-medium ml-auto">
                     <Link to="/" className="hover:text-blue-600 transition-colors">Accueil</Link>
                 </nav>
            )}
        </div>
    </div>
)

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center">
            <div className="max-w-5xl w-full mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
                
                <HeaderPastel currentPath="/" />

                {/* Reste du contenu Home.jsx */}
                <main className="py-16 px-6 text-center flex-grow">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                        Unischeduler
                    </h1>
                    <h2 className="text-xl text-gray-700 mb-10">
                        Une Consultation simplifiée des horaires
                    </h2>
                    
                    <Link 
                        to="/student"
                        className="inline-block px-8 py-3 rounded-full font-bold text-lg text-gray-700 bg-gray-300 hover:bg-gray-400 transition-colors shadow-md"
                    >
                        Consulter les emplois du temps
                    </Link>
                    
                    <Link 
                        to="/login"
                        className="inline-block mt-4 md:mt-0 md:ml-6 px-8 py-3 rounded-full font-bold text-lg text-gray-700 bg-gray-300 hover:bg-gray-400 transition-colors shadow-md"
                    >
                        Connexion Admin
                    </Link>

                    <p className="text-base text-gray-600 mt-16 max-w-2xl mx-auto italic">
                        Unischeduler est une plateforme permettant aux étudiants, enseignants et parents de consulter les emplois du temps
                    </p>
                </main>

                <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-500">
                    &copy;2025 – Université de Yaoundé I | Contact : info@uy1.cm
                </footer>
            </div>
        </div>
    )
}

export default Home