# Timetable Scheduler - Replit Project

## Overview
**Unischeduler** - Une plateforme complète de gestion des emplois du temps pour l'Université de Yaoundé II. Application web moderne permettant aux étudiants de consulter les emplois du temps sans inscription et aux administrateurs de gérer les plannings.

## Current State - Sprint 1 Complete ✅

### Frontend Stack
- **Framework**: React 18.2.0 + React Router v6
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.17
- **Design**: Modern gradients, responsive layout (mobile & desktop)
- **Color Scheme**: Blue-Purple gradients (no emojis)

### Project Architecture
```
src/
├── pages/
│   ├── Home.jsx              # Landing page with feature cards
│   ├── StudentPortal.jsx     # 4-step wizard for timetable search
│   ├── Login.jsx             # Admin authentication page
│   ├── Loading.jsx           # Loading animation page
│   └── NotFound.jsx          # 404 page
├── components/
│   ├── common/               # Reusable UI components
│   ├── layout/               # Header, Footer
│   ├── StudentPortal/        # Selection cards, TimetableView
│   ├── TimetableGrid/        # Timetable grid display
│   └── icons/                # SVG icons
├── data/
│   ├── sampleData.js         # Faculty/Department structure
│   └── timetableData.js      # Real course schedules (3 programs, 2 weeks)
├── constants/                # App configuration
├── hooks/                    # Custom React hooks
├── utils/                    # Helper functions
└── App.jsx                   # Main app with routing
```

## Sprint 1 Features - All Complete ✅

### User Story 1: Attractive Landing Page ✅
- Page d'accueil professionnelle avec gradient bleu-violet
- Logo et nom de l'école (Unischeduler - Université de Yaoundé)
- Description claire du système
- 3 cartes d'information (Étudiants, Administration, Efficacité)
- Boutons d'action vers les différentes sections
- Design responsive (mobile & desktop)

### User Story 2: Public Timetable View ✅
- Page sans connexion requise
- 4-step selection wizard:
  1. Sélection de la Faculté
  2. Sélection du Département
  3. Sélection du Programme
  4. Affichage de l'emploi du temps
- Filtre par semaine (Semaine 1-4)
- Grille hebdomadaire (Lundi-Vendredi)
- Informations complètes par cours:
  - Nom du cours
  - Enseignant
  - Salle
  - Type (Cours Magistral, TP, TD)
- Codes couleurs par type de cours
- Légende explicative
- Lecture seule - pas de modification possible

### User Story 3: Responsive Navigation ✅
- Menu cohérent sur toutes les pages
- Navigation fluide: Accueil → Emplois du Temps → Connexion Admin
- Pied de page avec informations de l'université
- Design responsive sur tous les appareils

### Additional Features - Page de Chargement ✅
- Loading page professionnelle avec:
  - Barre de progression animée
  - Boules d'animation
  - Logo de l'université
  - Redirection automatique

### Admin Login ✅
- Page de connexion sécurisée
- Formulaire avec validation
- Message d'information d'accès démo
- Design cohérent avec le reste de l'app

## Timetable Data - Sample Programs ✅

### Programmes Disponibles:
1. **Licence Informatique**
   - Cours Magistraux: Algorithmes, Bases de Données, Réseaux, Génie Logiciel, Sécurité, Cloud Computing
   - Travaux Pratiques: Programming C++, Labo SQL, TCP/IP, Projets
   - Travaux Dirigés: UML et Design Patterns, Cryptographie

2. **Licence Mathématiques**
   - Cours: Analyse Réelle, Algèbre Linéaire, Géométrie Différentielle, Statistiques
   - Travaux Dirigés: Exercices, Théorie des Nombres, Topologie

3. **Licence Chimie**
   - Cours: Chimie Organique, Chimie Inorganique, Biochimie, Chimie Analytique
   - Travaux Pratiques: Labo Chimie Organique, Chimie Analytique

## Routes Disponibles
- `/` - Page d'accueil
- `/student` - Consulter les emplois du temps (4-step wizard)
- `/login` - Connexion administrateur
- `/loading` - Animation de chargement
- `/*` - Page 404

## Dev Server Configuration
- **Port**: 5000
- **Host**: 0.0.0.0 (proxy-ready for Replit)
- **Command**: `npm run dev`
- **HMR**: Enabled (hot module replacement)

## Design System

### Color Palette
- **Primary**: Blue (#1e40af) → Purple (#7c3aed)
- **Secondary**: Pink (#ec4899)
- **Accent**: Orange (#f59e0b)
- **Background**: Professional abstract tech-themed image with dark overlay
  - Image: Modern abstract pattern with purple and blue tech elements
  - Overlay: Semi-transparent gradient for text readability
  - Effect: Fixed background that stays in place during scrolling
- **Card Effects**: Glassmorphism with semi-transparent white backgrounds
- **Overlays**: Dark gradient overlay on background for better contrast

### Typography
- Font Family: Segoe UI, Tahoma, Geneva, Verdana
- Headings: Bold, large sizes
- Text: Clear hierarchy, accessible

### Components
- Premium glassmorphism cards with backdrop blur
- Dark gradient background with fixed attachment
- Radial gradient overlays for visual interest
- Animated blur effects in hero sections
- Cards with hover effects and smooth transitions
- Gradients on headers and footers
- Rounded borders (xl, lg, 3xl)
- Smooth transitions (0.3s)
- Progress indicators with gradient fills
- Course type legend with color coding
- Professional shadows and depth layers

## Recent Changes - Sprint 2 Enhancements ✨

### Premium Design Upgrade
1. ✨ **Professional Background Image** - Abstract tech-themed design (NEW!)
   - Beautiful purple and blue abstract pattern
   - Fixed background that stays in place during scroll
   - Semi-transparent dark overlay for text readability
   - Gives real website aesthetic
2. Glassmorphism effects on all major containers with perfect contrast
3. Enhanced CSS with fixed background image and overlay system
4. Redesigned Home page with premium hero section and feature cards
5. All pages use professional glassmorphism aesthetic with new background

### Advanced Features Added (Sprint 2) 🚀
1. **Course Detail Modal** - Click any course to view full details in a beautiful modal
   - Shows: Course name, Teacher, Room, Time, Day, Type
   - Copy-to-clipboard functionality
   - Professional modal design with glassmorphism

2. **Search & Filter Functionality**
   - Real-time search by course name, teacher, or room
   - Highlighted matching courses in timetable
   - Dimmed non-matching courses for better visibility
   - Dynamic course filtering system

3. **Breadcrumb Navigation**
   - Visual path showing: Faculty → Department → Program → Timetable
   - Shows all selected options for current step
   - Improves user orientation in the wizard

4. **Print Timetable**
   - One-click print functionality for students
   - Full timetable export to print-friendly format

5. **Download CSV Export**
   - Export timetable as CSV file
   - Filename includes program and week info
   - Useful for Excel/spreadsheet applications

6. **Interactive Course Cards**
   - Hover effects with scale transform
   - Click-to-view details
   - Color-coded by course type (Lecture=Blue, Lab=Green, TD=Purple)
   - Abbreviated display for better readability

7. **New Icon Components**
   - PrintIcon
   - DownloadIcon
   - SearchIcon
   - CloseIcon

## Components Overview

### New Components (Sprint 2)
- **CourseDetailModal.jsx** - Modal for displaying full course information
- **CourseSearch.jsx** - Search component for filtering courses
- **Breadcrumb.jsx** - Navigation breadcrumb component

### Enhanced Components
- **TimetableView.jsx** - Now with search, print, download, and click-to-view-details
- **StudentPortal.jsx** - Added breadcrumb navigation display

### Icon Additions
- Print, Download, Search, Close icons added to icon library

## Component Structure
```
src/
├── components/
│   ├── StudentPortal/
│   │   ├── TimetableView.jsx (enhanced with modal + search)
│   │   ├── CourseDetailModal.jsx (new)
│   │   ├── CourseSearch.jsx (new)
│   │   └── SelectionCards.jsx
│   ├── common/
│   │   ├── Breadcrumb.jsx (new)
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Select.jsx
│   │   └── Input.jsx
│   ├── icons/
│   │   └── index.jsx (new icons added)
│   └── layout/
│       ├── Header.jsx
│       └── Footer.jsx
└── pages/
    ├── Home.jsx
    ├── StudentPortal.jsx (enhanced with breadcrumb)
    ├── Login.jsx
    ├── Loading.jsx
    └── NotFound.jsx
```

## User Interactions - Enhanced

### Timetable Viewing (Step 4)
1. **Search Courses** - Type to filter by course name, teacher, or room
2. **Click on Course** - View full course details in modal
3. **Copy Details** - Copy course info to clipboard from modal
4. **Print** - Print full timetable with one click
5. **Download** - Export timetable as CSV file
6. **Change Week** - View different weeks (Week 1-4)
7. **See Breadcrumb** - Track navigation path through wizard

### Navigation Flow
- **Breadcrumb** shows: Étape 1 › Faculté › Département › Programme
- **Progress Bar** shows visual step completion
- **Back Button** allows returning to previous steps

## Next Steps (Sprint 3)
- Admin login system with authentication
- Admin dashboard with statistics
- Basic timetable editor interface
- Data persistence layer
- Email notifications feature
- Timetable conflict detection
- Advanced filtering (by time, day, type)

## Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Performance Notes
- Fast initial load with Vite
- Hot module replacement for development
- Optimized re-renders with React hooks
- Smooth animations and transitions
- No external API calls (mock data only)

## Deployment Ready
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Ready for production deployment with proper backend integration
