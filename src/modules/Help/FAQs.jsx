import React, { useState, useEffect } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdHelpOutline } from "react-icons/md";
import api from "../../utils/api";
import colors from "../../styles/colors";
import typography from "../../styles/typography";

const FAQs = ({ isDarkTheme }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null); 
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await api.get("/faqs");
        if (res.data?.success) {
          setFaqs(res.data.faq_arr || []);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id); 
  };

  const theme = {
    text: isDarkTheme ? colors.textLight : colors.textMain,
    muted: isDarkTheme ? colors.darkMuted : colors.textMuted,
    cardBg: isDarkTheme ? colors.darkHover : "#ffffff",
    border: isDarkTheme ? colors.darkBorder : "#e2e8f0",
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "20px", color: theme.muted, fontSize: "13px" }}>Loading FAQs...</div>;
  }

  if (faqs.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 10px", color: theme.muted }}>
        <MdHelpOutline size={40} style={{ opacity: 0.3, marginBottom: "10px" }} />
        <p style={{ margin: 0, fontSize: "13px" }}>No FAQs available at the moment.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {faqs.map((faq) => {
        const isOpen = openId === faq.faq_id;
        return (
          <div 
            key={faq.faq_id} 
            style={{ 
              background: theme.cardBg, 
              border: `1px solid ${theme.border}`, 
              borderRadius: "8px", 
              overflow: "hidden",
              transition: "all 0.3s ease"
            }}
          >
            {/* Question Header */}
            <div 
              onClick={() => toggleFAQ(faq.faq_id)}
              style={{ 
                padding: "14px 16px", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                cursor: "pointer",
                background: isOpen ? (isDarkTheme ? "rgba(255,255,255,0.05)" : "#f8fafc") : "transparent"
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: isOpen ? "700" : "600", color: theme.text, flex: 1, paddingRight: "10px", lineHeight: "1.4", fontFamily: typography.fontFamily }}>
                {faq.question}
              </span>
              <div style={{ color: isOpen ? colors.primary : theme.muted, transition: "0.3s" }}>
                {isOpen ? <MdKeyboardArrowUp size={20} /> : <MdKeyboardArrowDown size={20} />}
              </div>
            </div>

            {/* Answer Body */}
            {isOpen && (
              <div style={{ 
                padding: "0 16px 16px 16px", 
                fontSize: "12px", 
                color: theme.muted, 
                lineHeight: "1.6",
                whiteSpace: "pre-wrap" 
              }}>
                <div style={{ marginTop: "4px", paddingTop: "12px", borderTop: `1px dashed ${theme.border}` }}>
                  {faq.answer}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FAQs;