import React, { useState, useEffect } from "react";
import { MdClose, MdInfoOutline } from "react-icons/md";
import api from "../../utils/api";
import colors from "../../styles/colors";

import FAQs from "../../modules/Help/FAQs"; 
import HelpCenter from "../../modules/Help/HelpCenter"; 
import MyTickets from "../../modules/Help/MyTickets";
import StaticContent from "../../modules/Help/StaticContent"; 

const SupportGrid = ({ isDarkTheme }) => {
  const [supportModal, setSupportModal] = useState(null);
  const [contentData, setContentData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        const response = await fetch("http://13.51.196.99:5000/api/public/content?company_id=1", {
          method: "GET",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
          setContentData(data.content_arr || []);
        }
      } catch (error) {
        console.error("Failed to fetch support content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const theme = {
    text: isDarkTheme ? colors.textLight : colors.textMain,
    muted: isDarkTheme ? colors.darkMuted : colors.textMuted,
    cardBg: isDarkTheme ? colors.darkHover : "#ffffff",
    border: isDarkTheme ? colors.darkBorder : "#e2e8f0",
  };

  // 🔥 Extract Title from HTML/Text Content
  const extractTitle = (htmlContent) => {
    if (!htmlContent) return "Information";
    
    // Check if it's HTML (like <h2>Title</h2>)
    const match = htmlContent.match(/<h[1-6]>(.*?)<\/h[1-6]>/i);
    if (match && match[1]) return match[1];

    // Fallback: Get first line of plain text
    const firstLine = htmlContent.split('\n')[0].trim();
    if (firstLine.length > 0 && firstLine.length < 50) return firstLine; // 50 chars limit for title

    return "Information";
  };

  // 🔥 Get Slug from URL
  const extractSlug = (url) => {
    if (!url) return null;
    const urlParams = new URLSearchParams(url.split('?')[1]);
    return urlParams.get('slug');
  };

  const renderSupportContent = (modalData) => {
    switch (modalData.type) {
      case "FAQs": return <FAQs isDarkTheme={isDarkTheme} />;
      case "Help Center": return <HelpCenter isDarkTheme={isDarkTheme} />;
      case "My Tickets": return <MyTickets isDarkTheme={isDarkTheme} />;
      case "Dynamic Content": 
        return <StaticContent data={contentData} slug={modalData.slug} loading={loading} isDarkTheme={isDarkTheme} />;
      default:
        return <div style={{ color: theme.muted, padding: "20px" }}>Content not available.</div>;
    }
  };

  const supportBox = (title, desc, color, icon, type, slug = null) => (
    <div key={title} onClick={() => setSupportModal({ title, color, icon, type, slug })} 
      style={{ padding: 12, borderRadius: 12, background: theme.cardBg, display: "flex", gap: 10, cursor: "pointer", border: `1px solid ${theme.border}` }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ overflow: "hidden" }}>
        <div style={{ fontWeight: 600, fontSize: "13px", color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        <div style={{ fontSize: 11, color: theme.muted, marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{desc}</div>
      </div>
    </div>
  );

  // 🔥 Separate dynamic contents (content_type === 1)
  const dynamicPages = contentData.filter(item => item.content_type === 1);

  return (
    <>
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: theme.text }}>Support & Information</div>
        <div style={supportGrid}>
          {/* Static Modules */}
          {supportBox("Help Center", "Raise a new request", "#4f46e5", "❓", "Help Center")}
          {supportBox("My Tickets", "View your past requests", "#8b5cf6", "🎫", "My Tickets")}
          {supportBox("FAQs", "Frequently asked questions", "#ec4899", "💬", "FAQs")}
          
          {/* 🔥 Dynamic Modules from API */}
          {dynamicPages.map((page, index) => {
            const title = extractTitle(page.content);
            const slug = extractSlug(page.content_url);
            const colorList = ["#0ea5e9", "#16a34a", "#f59e0b", "#eab308", "#14b8a6", "#f43f5e"];
            const color = colorList[index % colorList.length];

            return supportBox(title, "Company Information", color, <MdInfoOutline />, "Dynamic Content", slug);
          })}
        </div>
      </div>


       {/* <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: theme.text }}>Support & Information</div>
        <div style={supportGrid}>
          {supportBox("Help Center", "Raise a new request", "#4f46e5", "❓")}
          {supportBox("My Tickets", "View your past requests", "#8b5cf6", "🎫")}
          {supportBox("About Us", "Know more about our company", "#0ea5e9", "🏢")}
          {supportBox("Privacy Policy", "How we handle your data", "#16a34a", "🔒")}
          {supportBox("Terms & Conditions", "Platform usage rules", "#f59e0b", "📜")}
          {supportBox("FAQs", "Frequently asked questions", "#ec4899", "💬")}
        </div>
      </div> */}

      {supportModal && (
        <div style={overlayStyle}>
          <div style={{ ...supportModalStyle, background: theme.cardBg, border: `1px solid ${theme.border}` }}>
            <div style={{ ...supportHeaderStyle, background: supportModal.color }}>
              <span>{supportModal.icon}</span>
              <h3 style={{ margin: 0, fontSize: "16px" }}>{supportModal.title}</h3>
              <MdClose style={{ marginLeft: "auto", cursor: "pointer" }} onClick={() => setSupportModal(null)} />
            </div>
            <div style={{ ...supportBodyStyle, background: isDarkTheme ? colors.darkBg : "#f8fafc" }}>
              {renderSupportContent(supportModal)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* --- STYLES --- */
const supportGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "16px" };
const supportModalStyle = { width: "100%", maxWidth: 500, borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" };
const supportHeaderStyle = { padding: "16px 20px", color: "#fff", display: "flex", alignItems: "center", gap: 12 };
const supportBodyStyle = { padding: "20px", fontSize: "13px", maxHeight: "60vh", overflowY: "auto" };

export default SupportGrid;