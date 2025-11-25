import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timetables, setTimetables] = useState([
    { id: 1, name: 'CS L1', faculty: 'Sciences', courses: 12, status: 'active' },
    { id: 2, name: 'ENG L2', faculty: 'Engineering', courses: 15, status: 'active' },
    { id: 3, name: 'BUS L1', faculty: 'Business', courses: 10, status: 'pending' },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTimetable, setNewTimetable] = useState({ name: '', faculty: '', courses: '' });

  const handleAddTimetable = () => {
    if (newTimetable.name && newTimetable.faculty) {
      setTimetables([
        ...timetables,
        { id: Date.now(), ...newTimetable, courses: parseInt(newTimetable.courses) || 0, status: 'pending' }
      ]);
      setNewTimetable({ name: '', faculty: '', courses: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteTimetable = (id) => {
    setTimetables(timetables.filter(t => t.id !== id));
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <Header />

      <main className='flex-grow'>
        {/* Dashboard Header */}
        <div className='bg-white border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <h1 className='text-3xl font-bold text-gray-900'>Tableau de bord Administration</h1>
            <p className='text-gray-600 text-sm mt-1'>Gérez les emplois du temps et les horaires</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className='bg-white border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <nav className='flex gap-12 text-sm font-medium'>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-700'
                }`}
              >
                Aperçu
              </button>
              <button
                onClick={() => setActiveTab('timetables')}
                className={`py-4 border-b-2 transition ${
                  activeTab === 'timetables'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-700'
                }`}
              >
                Emplois du temps
              </button>
              <button
                onClick={() => setActiveTab('faculty')}
                className={`py-4 border-b-2 transition ${
                  activeTab === 'faculty'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-700'
                }`}
              >
                Facultés & Départements
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 border-b-2 transition ${
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-700'
                }`}
              >
                Paramètres
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className='text-xl font-bold text-gray-900 mb-6'>Aperçu du tableau de bord</h2>
              
              {/* Stats Cards - Clean */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
                <div className='bg-white rounded-md border border-gray-200 p-6'>
                  <div className='text-sm text-gray-600 font-medium mb-2'>Total Facultés</div>
                  <div className='text-3xl font-bold text-gray-900'>5</div>
                  <div className='text-xs text-gray-500 mt-2'>Actives</div>
                </div>
                <div className='bg-white rounded-md border border-gray-200 p-6'>
                  <div className='text-sm text-gray-600 font-medium mb-2'>Total Départements</div>
                  <div className='text-3xl font-bold text-gray-900'>18</div>
                  <div className='text-xs text-gray-500 mt-2'>Tous les départements</div>
                </div>
                <div className='bg-white rounded-md border border-gray-200 p-6'>
                  <div className='text-sm text-gray-600 font-medium mb-2'>Programmes</div>
                  <div className='text-3xl font-bold text-gray-900'>42</div>
                  <div className='text-xs text-gray-500 mt-2'>Programmes actifs</div>
                </div>
                <div className='bg-white rounded-md border border-gray-200 p-6'>
                  <div className='text-sm text-gray-600 font-medium mb-2'>Dernière mise à jour</div>
                  <div className='text-2xl font-bold text-gray-900'>Aujourd'hui</div>
                  <div className='text-xs text-gray-500 mt-2'>14:30</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className='bg-white rounded-md border border-gray-200 p-6'>
                <h3 className='text-lg font-bold text-gray-900 mb-4'>Emplois du temps récents</h3>
                <div className='divide-y'>
                  {timetables.slice(0, 3).map((item) => (
                    <div key={item.id} className='py-4 flex justify-between items-center'>
                      <div>
                        <div className='font-medium text-gray-900'>{item.name}</div>
                        <div className='text-xs text-gray-500'>{item.faculty}</div>
                      </div>
                      <span className='text-xs px-2 py-1 rounded bg-gray-100 text-gray-700'>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timetables Tab */}
          {activeTab === 'timetables' && (
            <div>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-bold text-gray-900'>Gérer les emplois du temps</h2>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium'
                >
                  {showAddForm ? 'Annuler' : 'Ajouter un nouvel emploi du temps'}
                </button>
              </div>

              {/* Add Form */}
              {showAddForm && (
                <div className='bg-white rounded-md border border-gray-200 p-6 mb-6'>
                  <h3 className='text-base font-semibold text-gray-900 mb-4'>Nouvel emploi du temps</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <input
                      type='text'
                      placeholder='Nom'
                      value={newTimetable.name}
                      onChange={(e) => setNewTimetable({...newTimetable, name: e.target.value})}
                      className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600'
                    />
                    <input
                      type='text'
                      placeholder='Faculté'
                      value={newTimetable.faculty}
                      onChange={(e) => setNewTimetable({...newTimetable, faculty: e.target.value})}
                      className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600'
                    />
                    <input
                      type='number'
                      placeholder='Nombre de cours'
                      value={newTimetable.courses}
                      onChange={(e) => setNewTimetable({...newTimetable, courses: e.target.value})}
                      className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-600'
                    />
                  </div>
                  <button 
                    onClick={handleAddTimetable}
                    className='mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium'
                  >
                    Enregistrer
                  </button>
                </div>
              )}

              {/* Table */}
              <div className='bg-white rounded-md border border-gray-200 overflow-hidden'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-b'>
                    <tr>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>Nom</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>Faculté</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>Cours</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>Statut</th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {timetables.map((item) => (
                      <tr key={item.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 text-sm text-gray-900 font-medium'>{item.name}</td>
                        <td className='px-6 py-4 text-sm text-gray-600'>{item.faculty}</td>
                        <td className='px-6 py-4 text-sm text-gray-600'>{item.courses}</td>
                        <td className='px-6 py-4 text-sm'>
                          <span className='bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs'>{item.status}</span>
                        </td>
                        <td className='px-6 py-4 text-sm space-x-4'>
                          <button className='text-blue-600 hover:text-blue-700 text-sm font-medium'>Éditer</button>
                          <button 
                            onClick={() => handleDeleteTimetable(item.id)}
                            className='text-red-600 hover:text-red-700 text-sm font-medium'
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Faculty Tab */}
          {activeTab === 'faculty' && (
            <div>
              <h2 className='text-xl font-bold text-gray-900 mb-6'>Facultés & Départements</h2>
              <div className='bg-white rounded-md border border-gray-200 p-6'>
                <p className='text-gray-600 text-sm'>Fonctionnalité en développement</p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className='text-xl font-bold text-gray-900 mb-6'>Paramètres</h2>
              <div className='bg-white rounded-md border border-gray-200 p-6'>
                <p className='text-gray-600 text-sm'>Fonctionnalité en développement</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
