import React from 'react'
import './AdminNavbar.css'
import adminnavlogo from '../../assets/adminnav-logo.svg'
import adminNavProfile from '../../assets/nav-profile.svg'


function AdminNavbar() {
  return (
    <div className='adminnavbar'>
        <img src={adminnavlogo} alt="" className="adminnav-logo" />
        <img src={adminNavProfile} alt="" className='adminnav-profile' />
    </div>
  )
}

export default AdminNavbar