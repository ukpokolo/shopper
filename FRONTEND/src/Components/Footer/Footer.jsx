import React from 'react'
import './Footer.css'
import footer_logo from '../Assets/logo_big.png'
import instagram_icon from '../Assets/instagram_icon.png'
import pinterest_icon from "../Assets/pinterest_icon.png"
import whatsapp_icon from '../Assets/whatsapp_icon.png'

function Footer() {
  return (
    <div className='footer'>
        <div className="footer-logo">
            <img src={footer_logo} alt="" />
            <p>SHOPPER</p>
        </div>
        <ul className="footer-links">
            <li>Company</li>
            <li>Products</li>
            <li>Offices</li>
            <li>About</li>
            <li>Contact</li>
        </ul>
        <div className="footer-socials-icon">
            <div className="footer-icon-container">
                <img src={instagram_icon} alt="" />                
            </div>
            <div className="footer-icon-container">
                <img src={pinterest_icon} alt="" />                
            </div>
            <div className="footer-icon-container">
                <img src={whatsapp_icon} alt="" />                
            </div>
        </div>
        <div className="footer-copyright">
            <hr />
            <p>Copyright @ 2023 - All Right Reserved</p>
        </div>
    </div>
  )
}

export default Footer