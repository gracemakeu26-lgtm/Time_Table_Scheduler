import React from 'react';

const DepartmentsTab = ({
  departments,
  showAddDepartmentForm,
  setShowAddDepartmentForm,
  newDepartment,
  setNewDepartment,
  handleAddDepartment,
  editingDepartmentId,
  editDepartmentData,
  setEditDepartmentData,
  handleEditDepartment,
  handleSaveEditDepartment,
  handleCancelEditDepartment,
  handleDeleteDepartment,
}) => {
  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-bold text-gray-900'>Departments</h2>
        <button
          onClick={() => setShowAddDepartmentForm(!showAddDepartmentForm)}
          className='bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium'
        >
          {showAddDepartmentForm ? 'Cancel' : 'Add Department'}
        </button>
      </div>

      {/* Add Department Form */}
      {showAddDepartmentForm && (
        <div className='bg-white rounded-md border border-gray-200 p-6 mb-6'>
          <h3 className='text-base font-semibold text-gray-900 mb-4'>
            New Department
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <input
              type='text'
              placeholder='Department Name *'
              value={newDepartment.name}
              onChange={(e) =>
                setNewDepartment({
                  ...newDepartment,
                  name: e.target.value,
                })
              }
              className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
            />
            <input
              type='text'
              placeholder='Code'
              value={newDepartment.code}
              onChange={(e) =>
                setNewDepartment({
                  ...newDepartment,
                  code: e.target.value,
                })
              }
              className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
            />
            <input
              type='text'
              placeholder='Head'
              value={newDepartment.head}
              onChange={(e) =>
                setNewDepartment({
                  ...newDepartment,
                  head: e.target.value,
                })
              }
              className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
            />
            <input
              type='email'
              placeholder='Contact Email'
              value={newDepartment.contact_email}
              onChange={(e) =>
                setNewDepartment({
                  ...newDepartment,
                  contact_email: e.target.value,
                })
              }
              className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
            />
          </div>
          <button
            onClick={handleAddDepartment}
            className='mt-4 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium'
          >
            Save
          </button>
        </div>
      )}

      {/* Departments Table - Desktop View */}
      <div className='hidden md:block bg-white/10 backdrop-blur-3xl rounded-md overflow-hidden'>
        {departments.length === 0 ? (
          <div className='p-8 text-center text-gray-400'>
            No departments found
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap'>
                    Name
                  </th>
                  <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap'>
                    Code
                  </th>
                  <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap'>
                    Head
                  </th>
                  <th className='px-6 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {departments.map((item) => (
                  <tr key={item.id} className='hover:bg-gray-50'>
                    {editingDepartmentId === item.id ? (
                      <>
                        <td className='px-6 py-4 text-sm'>
                          <input
                            type='text'
                            value={editDepartmentData.name || ''}
                            onChange={(e) =>
                              setEditDepartmentData({
                                ...editDepartmentData,
                                name: e.target.value,
                              })
                            }
                            className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          />
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          <input
                            type='text'
                            value={editDepartmentData.code || ''}
                            onChange={(e) =>
                              setEditDepartmentData({
                                ...editDepartmentData,
                                code: e.target.value,
                              })
                            }
                            className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          />
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          <input
                            type='text'
                            value={editDepartmentData.head || ''}
                            onChange={(e) =>
                              setEditDepartmentData({
                                ...editDepartmentData,
                                head: e.target.value,
                              })
                            }
                            className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                          />
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          <div className='flex space-x-2 whitespace-nowrap'>
                            <button
                              onClick={handleSaveEditDepartment}
                              className='text-gray-900 hover:text-gray-700 text-sm font-medium'
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEditDepartment}
                              className='text-gray-600 hover:text-gray-700 text-sm font-medium'
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className='px-6 py-4 text-sm text-gray-900 font-medium'>
                          {item.name}
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-400'>
                          {item.code || 'N/A'}
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-400'>
                          {item.head || 'N/A'}
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          <div className='flex space-x-4 whitespace-nowrap'>
                            <button
                              onClick={() => handleEditDepartment(item.id)}
                              className='text-gray-900 hover:text-gray-700 text-sm font-medium'
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDepartment(item.id)}
                              className='text-gray-400 hover:text-gray-700 text-sm font-medium'
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Departments Cards - Mobile View */}
      <div className='md:hidden space-y-4'>
        {departments.length === 0 ? (
          <div className='bg-white/10 backdrop-blur-3xl rounded-md p-8 text-center text-gray-400'>
            No departments found
          </div>
        ) : (
          departments.map((item) => (
            <div
              key={item.id}
              className='bg-white/10 backdrop-blur-3xl rounded-md p-4 border border-gray-200'
            >
              {editingDepartmentId === item.id ? (
                <div className='space-y-4'>
                  <div className='space-y-3'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Name
                      </label>
                      <input
                        type='text'
                        value={editDepartmentData.name || ''}
                        onChange={(e) =>
                          setEditDepartmentData({
                            ...editDepartmentData,
                            name: e.target.value,
                          })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Code
                      </label>
                      <input
                        type='text'
                        value={editDepartmentData.code || ''}
                        onChange={(e) =>
                          setEditDepartmentData({
                            ...editDepartmentData,
                            code: e.target.value,
                          })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Head
                      </label>
                      <input
                        type='text'
                        value={editDepartmentData.head || ''}
                        onChange={(e) =>
                          setEditDepartmentData({
                            ...editDepartmentData,
                            head: e.target.value,
                          })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500'
                      />
                    </div>
                  </div>
                  <div className='flex space-x-3 pt-3 border-t border-gray-200'>
                    <button
                      onClick={handleSaveEditDepartment}
                      className='flex-1 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium'
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEditDepartment}
                      className='flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition text-sm font-medium'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className='space-y-3'>
                  <div className='space-y-2'>
                    <div>
                      <span className='text-sm font-medium text-gray-700'>
                        Name:
                      </span>
                      <span className='ml-2 text-sm text-gray-900 font-semibold'>
                        {item.name}
                      </span>
                    </div>
                    <div>
                      <span className='text-sm font-medium text-gray-700'>
                        Code:
                      </span>
                      <span className='ml-2 text-sm text-gray-600'>
                        {item.code || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className='text-sm font-medium text-gray-700'>
                        Head:
                      </span>
                      <span className='ml-2 text-sm text-gray-600'>
                        {item.head || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className='flex space-x-3 pt-3 border-t border-gray-200'>
                    <button
                      onClick={() => handleEditDepartment(item.id)}
                      className='flex-1 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(item.id)}
                      className='flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition text-sm font-medium'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DepartmentsTab;
