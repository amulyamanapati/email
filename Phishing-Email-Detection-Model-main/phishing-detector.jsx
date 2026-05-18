import { useState, useEffect, useRef } from "react";

// ─── DATASET ────────────────────────────────────────────────────────────────
const DATASET = [
  // PHISHING
  { label: 1, subject: "Urgent: Verify your account now", body: "Dear user, your account has been compromised. Click here http://login-secure-bank.xyz/verify to reset your password immediately or your account will be suspended." },
  { label: 1, subject: "You've won a prize!", body: "Congratulations! You have been selected to receive $1000. Claim your reward at http://free-gift-promo.net/claim?ref=12345 before it expires!" },
  { label: 1, subject: "Important: Update your billing info", body: "Your payment failed. Provide your credit card details at http://paypal-secure-update.ru/billing to avoid service interruption." },
  { label: 1, subject: "Verify your identity", body: "Dear customer, we detected unusual login. Verify your account at http://amazon-security-check.info/login immediately." },
  { label: 1, subject: "Your package could not be delivered", body: "DHL: Your shipment is on hold. Confirm address http://dhl-tracking-support.xyz/confirm and pay $2.99 fee to release." },
  { label: 1, subject: "Action Required: Account suspended", body: "Your Netflix account has been suspended due to payment issue. Update at http://netflix-billing-update.xyz/pay now." },
  { label: 1, subject: "Final warning - account closure", body: "FINAL NOTICE: Click http://irs-refund-claim.com/refund to claim your tax refund of $3200 before account closure." },
  { label: 1, subject: "Security alert: unusual activity", body: "Your Apple ID was used to sign in. If this wasn't you visit http://apple-id-verify.net/confirm to secure account." },
  { label: 1, subject: "Claim your lottery winnings", body: "You have won the international lottery! Send your personal information to lottery@winprize.tk to claim $500,000." },
  { label: 1, subject: "Free iPhone 15 giveaway", body: "You are today's lucky winner. Get your free iPhone at http://iphone-giveaway-winner.xyz/redeem. Limited time offer!" },
  { label: 1, subject: "Reset password immediately", body: "Your password expires today. Reset now at http://secure-microsoft-login.info/reset or lose access permanently." },
  { label: 1, subject: "Refund available for you", body: "Dear valued customer, a refund of $89.99 is pending. Login at http://paypal-refund-center.ru/claim your money now." },
  { label: 1, subject: "Bank account on hold", body: "Your bank account has been placed on hold. Verify identity immediately at http://chase-secure-verify.net/auth to restore." },
  { label: 1, subject: "Click to confirm your email", body: "Confirm your email to avoid deactivation http://confirm-email-now.xyz/verify?token=abc123 expires in 24 hours." },
  { label: 1, subject: "Exclusive offer just for you", body: "Congratulations! You qualify for a $500 Amazon gift card. Verify at http://amazon-rewards-promo.tk/gift today only!" },
  // SAFE
  { label: 0, subject: "Team standup at 10am", body: "Hi everyone, just a reminder that we have our weekly standup at 10am in the main conference room. Please be on time." },
  { label: 0, subject: "Your order has shipped", body: "Great news! Your order #78234 has shipped and will arrive by Thursday. You can track it using code TRK-4892X on our website." },
  { label: 0, subject: "Meeting notes from yesterday", body: "Hi team, attached are the meeting notes from our product sync yesterday. Please review and add any comments by Friday." },
  { label: 0, subject: "Monthly newsletter", body: "Welcome to our monthly newsletter. This month we cover product updates, team milestones, and upcoming events in Q3." },
  { label: 0, subject: "Your receipt from Apple", body: "Thank you for your purchase of iCloud+ 200GB plan for $2.99/month. Your next billing date is June 15, 2024." },
  { label: 0, subject: "Project deadline reminder", body: "This is a friendly reminder that the project proposal is due next Monday. Please submit your drafts to the shared drive." },
  { label: 0, subject: "Welcome to the team!", body: "Hi Sarah, we're so excited to have you join us on Monday. Your manager David will meet you at reception at 9am." },
  { label: 0, subject: "Invoice #4521 from Adobe", body: "Your invoice #4521 for Adobe Creative Cloud subscription ($54.99) is attached. Payment is due within 30 days." },
  { label: 0, subject: "Your GitHub pull request was merged", body: "Congratulations! Pull request #234 'Fix login bug' has been merged into main by reviewer jsmith. Great work!" },
  { label: 0, subject: "Quarterly performance review", body: "Your Q2 performance review is scheduled for next week. Please complete the self-assessment form in the HR portal." },
  { label: 0, subject: "Conference room booking confirmed", body: "Room A-204 is confirmed for your 2pm meeting on Thursday July 11. Contact facilities if you need AV equipment." },
  { label: 0, subject: "New comment on your post", body: "Jane Smith commented on your LinkedIn post: 'Great insights on machine learning applications! Very informative article.'" },
  { label: 0, subject: "Library book due soon", body: "This is a reminder that 'Clean Code' by Robert Martin is due in 3 days. Renew online at library.edu/account." },
  { label: 0, subject: "Lunch menu for this week", body: "This week's cafeteria specials include grilled salmon on Tuesday, vegetarian curry on Wednesday, and BBQ on Friday." },
  { label: 0, subject: "Software update available", body: "A new version of Slack (4.35.126) is available with bug fixes and performance improvements. Update at your convenience." },
];

// ─── FEATURE EXTRACTION ─────────────────────────────────────────────────────
function extractFeatures(subject, body) {
  const text = (subject + " " + body).toLowerCase();
  const urls = (text.match(/https?:\/\/[^\s]+/gi) || []);
  const suspiciousTlds = urls.filter(u => /\.(xyz|tk|ru|info|net|club|top|pw|cc|biz)(\b|\/)/i.test(u)).length;
  const urgencyWords = (text.match(/\b(urgent|immediately|now|expire|suspend|final|warning|act now|limited|today only|hours|verify|confirm|click here|restricted|compromised)\b/gi) || []).length;
  const moneyWords = (text.match(/\b(\$[\d,]+|free|win|prize|reward|gift|refund|claim|lottery|won|cash|money)\b/gi) || []).length;
  const threatWords = (text.match(/\b(suspended|blocked|hold|deactivate|close|lose access|compromised|detected|unusual|alert|security)\b/gi) || []).length;
  const hasUrl = urls.length > 0 ? 1 : 0;
  const urlCount = Math.min(urls.length, 5);
  const hasExternalDomain = urls.some(u => /^https?:\/\/(?!(?:www\.)?(google|microsoft|apple|amazon|github|slack|adobe|netflix|paypal|chase|dhl)\.com)/i.test(u)) ? 1 : 0;
  const allCapsWords = (text.match(/\b[A-Z]{4,}\b/g) || []).length;
  const exclamations = (subject + " " + body).split("!").length - 1;
  const personalInfo = (text.match(/\b(credit card|ssn|social security|password|account number|billing|payment info|bank)\b/gi) || []).length;
  const wordCount = text.split(/\s+/).length;
  const subjectLength = subject.length;

  return [
    urgencyWords / Math.max(wordCount, 1) * 10,
    moneyWords / Math.max(wordCount, 1) * 10,
    threatWords / Math.max(wordCount, 1) * 10,
    suspiciousTlds,
    hasUrl,
    urlCount,
    hasExternalDomain,
    allCapsWords / Math.max(wordCount, 1) * 10,
    Math.min(exclamations, 5),
    personalInfo,
    subjectLength / 50,
    urls.length > 1 ? 1 : 0,
  ];
}

// ─── NAIVE BAYES CLASSIFIER ──────────────────────────────────────────────────
class NaiveBayesClassifier {
  constructor() {
    this.phishingStats = null;
    this.safeStats = null;
    this.phishingPrior = 0;
    this.safePrior = 0;
    this.trained = false;
    this.confusionMatrix = [[0,0],[0,0]];
    this.accuracy = 0;
    this.featureImportance = [];
  }

  train(data) {
    const phishing = data.filter(d => d.label === 1);
    const safe = data.filter(d => d.label === 0);
    this.phishingPrior = phishing.length / data.length;
    this.safePrior = safe.length / data.length;

    const getFeatures = items => items.map(d => extractFeatures(d.subject, d.body));
    const phishFeats = getFeatures(phishing);
    const safeFeats = getFeatures(safe);

    const nFeats = phishFeats[0].length;
    this.phishingStats = Array.from({length: nFeats}, (_, i) => {
      const vals = phishFeats.map(f => f[i]);
      const mean = vals.reduce((a,b)=>a+b,0)/vals.length;
      const variance = vals.reduce((a,b)=>a+(b-mean)**2,0)/vals.length + 1e-6;
      return {mean, variance};
    });
    this.safeStats = Array.from({length: nFeats}, (_, i) => {
      const vals = safeFeats.map(f => f[i]);
      const mean = vals.reduce((a,b)=>a+b,0)/vals.length;
      const variance = vals.reduce((a,b)=>a+(b-mean)**2,0)/vals.length + 1e-6;
      return {mean, variance};
    });

    // compute feature importance (mean diff between classes)
    this.featureImportance = Array.from({length: nFeats}, (_, i) => ({
      index: i,
      importance: Math.abs(this.phishingStats[i].mean - this.safeStats[i].mean)
    })).sort((a,b) => b.importance - a.importance);

    // evaluate on training data
    let correct = 0;
    const cm = [[0,0],[0,0]];
    data.forEach(d => {
      const pred = this.predict(d.subject, d.body);
      cm[d.label][pred.label]++;
      if (pred.label === d.label) correct++;
    });
    this.confusionMatrix = cm;
    this.accuracy = correct / data.length;
    this.trained = true;
  }

  gaussianLogProb(x, mean, variance) {
    return -0.5 * Math.log(2 * Math.PI * variance) - ((x - mean) ** 2) / (2 * variance);
  }

  predict(subject, body) {
    const feats = extractFeatures(subject, body);
    let logPhish = Math.log(this.phishingPrior);
    let logSafe = Math.log(this.safePrior);
    feats.forEach((f, i) => {
      logPhish += this.gaussianLogProb(f, this.phishingStats[i].mean, this.phishingStats[i].variance);
      logSafe += this.gaussianLogProb(f, this.safeStats[i].mean, this.safeStats[i].variance);
    });
    const maxLog = Math.max(logPhish, logSafe);
    const pPhish = Math.exp(logPhish - maxLog);
    const pSafe = Math.exp(logSafe - maxLog);
    const total = pPhish + pSafe;
    const confidence = pPhish / total;
    return { label: confidence > 0.5 ? 1 : 0, confidence, features: feats };
  }
}

const FEATURE_NAMES = [
  "Urgency Score", "Money/Prize Score", "Threat Score",
  "Suspicious TLDs", "Has URL", "URL Count",
  "External Domain", "ALL CAPS Words", "Exclamations",
  "Personal Info Requests", "Subject Length", "Multiple URLs"
];

const classifier = new NaiveBayesClassifier();
classifier.train(DATASET);

// ─── SAMPLE EMAILS ───────────────────────────────────────────────────────────
const SAMPLES = [
  { label: "Phishing", subject: "URGENT: Your account will be closed!", body: "Dear user, we detected unusual activity on your account. Verify immediately at http://secure-bank-login.xyz/verify or your account will be suspended within 24 hours." },
  { label: "Safe", subject: "Project update for Q3", body: "Hi team, just wanted to share the latest project status. We're on track for the Q3 deadline. Please review the attached document and share feedback by Friday." },
  { label: "Phishing", subject: "You won $5000!", body: "Congratulations! You are our lucky winner. Claim your $5000 prize at http://lottery-winner-prize.tk/claim?id=999 today. Offer expires in 2 hours!" },
  { label: "Safe", subject: "Your receipt from Spotify", body: "Thank you for your subscription renewal. Your Spotify Premium plan ($9.99/month) has been renewed. Your next billing date is August 12." },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function PhishingDetector() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("detect");
  const [animIn, setAnimIn] = useState(false);
  const [scanLine, setScanLine] = useState(false);
  const canvasRef = useRef(null);
  const [trainResults] = useState(() => ({
    accuracy: classifier.accuracy,
    cm: classifier.confusionMatrix,
  }));

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 100);
    // animated background grid
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(0,255,136,0.04)";
      ctx.lineWidth = 1;
      const sz = 40;
      for (let x = 0; x < canvas.width; x += sz) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += sz) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      // scan line
      const scanY = ((frame * 1.5) % canvas.height);
      const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 10);
      grad.addColorStop(0, "rgba(0,255,136,0)");
      grad.addColorStop(1, "rgba(0,255,136,0.06)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 60, canvas.width, 70);
      frame++;
      requestAnimationFrame(draw);
    };
    draw();
  }, []);

  const analyze = () => {
    if (!subject.trim() && !body.trim()) return;
    setScanLine(true);
    setResult(null);
    setTimeout(() => {
      const res = classifier.predict(subject, body);
      setResult(res);
      setScanLine(false);
    }, 1400);
  };

  const loadSample = (s) => {
    setSubject(s.subject);
    setBody(s.body);
    setResult(null);
  };

  const precision = trainResults.cm[1][1] / Math.max(trainResults.cm[0][1] + trainResults.cm[1][1], 1);
  const recall = trainResults.cm[1][1] / Math.max(trainResults.cm[1][0] + trainResults.cm[1][1], 1);
  const f1 = 2 * precision * recall / Math.max(precision + recall, 1e-9);

  return (
    <div style={{
      minHeight: "100vh", background: "#050b12",
      fontFamily: "'Courier New', monospace",
      color: "#c8d8e8", position: "relative", overflow: "hidden"
    }}>
      <canvas ref={canvasRef} style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0
      }} />

      {/* HEADER */}
      <div style={{
        position: "relative", zIndex: 10,
        borderBottom: "1px solid #0f3a28",
        background: "rgba(5,11,18,0.95)",
        padding: "18px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: "linear-gradient(135deg, #00ff88, #00cc6a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: "0 0 20px rgba(0,255,136,0.4)"
          }}>🛡</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#00ff88", letterSpacing: 2 }}>
              PHISH<span style={{ color: "#fff" }}>GUARD</span>
            </div>
            <div style={{ fontSize: 10, color: "#4a8a6a", letterSpacing: 3, marginTop: 1 }}>
              ML EMAIL CLASSIFIER v2.4
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["detect", "model", "dataset"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: "6px 18px", borderRadius: 4, cursor: "pointer",
              background: activeTab === t ? "rgba(0,255,136,0.15)" : "transparent",
              border: activeTab === t ? "1px solid #00ff88" : "1px solid #1a3a2a",
              color: activeTab === t ? "#00ff88" : "#4a7a6a",
              fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
              transition: "all 0.2s"
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 10, padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>

        {/* DETECT TAB */}
        {activeTab === "detect" && (
          <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "none" : "translateY(20px)", transition: "all 0.5s" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {SAMPLES.map((s, i) => (
                <button key={i} onClick={() => loadSample(s)} style={{
                  padding: "10px 16px", borderRadius: 6, cursor: "pointer", textAlign: "left",
                  background: s.label === "Phishing" ? "rgba(255,50,50,0.06)" : "rgba(0,255,136,0.05)",
                  border: s.label === "Phishing" ? "1px solid rgba(255,50,50,0.25)" : "1px solid rgba(0,255,136,0.2)",
                  color: "#c8d8e8", transition: "all 0.2s"
                }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, marginBottom: 3, color: s.label === "Phishing" ? "#ff4444" : "#00ff88" }}>
                    {s.label === "Phishing" ? "⚠ SAMPLE PHISHING" : "✓ SAMPLE SAFE"}
                  </div>
                  <div style={{ fontSize: 12, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{s.subject}</div>
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 10, letterSpacing: 3, color: "#4a8a6a", display: "block", marginBottom: 8 }}>EMAIL SUBJECT</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Enter email subject..." style={{
                  width: "100%", padding: "12px 14px", borderRadius: 6, boxSizing: "border-box",
                  background: "rgba(0,255,136,0.04)", border: "1px solid #0f3a28",
                  color: "#c8d8e8", fontSize: 13, outline: "none",
                  fontFamily: "'Courier New', monospace"
                }} />
                <label style={{ fontSize: 10, letterSpacing: 3, color: "#4a8a6a", display: "block", margin: "16px 0 8px" }}>EMAIL BODY</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={7} placeholder="Paste email content here..." style={{
                  width: "100%", padding: "12px 14px", borderRadius: 6, boxSizing: "border-box",
                  background: "rgba(0,255,136,0.04)", border: "1px solid #0f3a28",
                  color: "#c8d8e8", fontSize: 12, resize: "none", outline: "none",
                  fontFamily: "'Courier New', monospace", lineHeight: 1.6
                }} />
                <button onClick={analyze} disabled={!subject.trim() && !body.trim()} style={{
                  marginTop: 14, width: "100%", padding: "13px", borderRadius: 6,
                  background: subject.trim() || body.trim() ? "linear-gradient(135deg, #00ff88, #00cc6a)" : "#0f2a1a",
                  border: "none", color: subject.trim() || body.trim() ? "#050b12" : "#1a4a2a",
                  fontSize: 13, fontWeight: 700, letterSpacing: 3, cursor: "pointer",
                  fontFamily: "'Courier New', monospace", transition: "all 0.3s",
                  boxShadow: subject.trim() || body.trim() ? "0 0 30px rgba(0,255,136,0.3)" : "none"
                }}>
                  {scanLine ? "◈ ANALYZING..." : "◈ SCAN EMAIL"}
                </button>
              </div>

              <div>
                {scanLine && (
                  <div style={{
                    height: "100%", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 20
                  }}>
                    <div style={{ fontSize: 48, animation: "spin 1s linear infinite" }}>⊛</div>
                    <div style={{ fontSize: 11, letterSpacing: 4, color: "#00ff88" }}>SCANNING FEATURES...</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["URLs", "KEYWORDS", "THREATS", "PATTERNS"].map((t, i) => (
                        <div key={t} style={{
                          padding: "4px 10px", borderRadius: 3, fontSize: 9, letterSpacing: 2,
                          background: "rgba(0,255,136,0.1)", border: "1px solid #00ff88",
                          color: "#00ff88", animation: `pulse 0.8s ${i * 0.2}s infinite`
                        }}>{t}</div>
                      ))}
                    </div>
                  </div>
                )}

                {result && !scanLine && (
                  <div style={{ animation: "fadeIn 0.4s ease" }}>
                    {/* VERDICT */}
                    <div style={{
                      padding: "20px", borderRadius: 10, marginBottom: 16, textAlign: "center",
                      background: result.label === 1 ? "rgba(255,50,50,0.1)" : "rgba(0,255,136,0.08)",
                      border: result.label === 1 ? "2px solid rgba(255,50,50,0.5)" : "2px solid rgba(0,255,136,0.4)",
                      boxShadow: result.label === 1 ? "0 0 30px rgba(255,50,50,0.15)" : "0 0 30px rgba(0,255,136,0.12)"
                    }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>{result.label === 1 ? "🚨" : "✅"}</div>
                      <div style={{
                        fontSize: 22, fontWeight: 700, letterSpacing: 4,
                        color: result.label === 1 ? "#ff4444" : "#00ff88"
                      }}>
                        {result.label === 1 ? "PHISHING DETECTED" : "EMAIL IS SAFE"}
                      </div>
                      <div style={{ marginTop: 10, fontSize: 11, color: "#7a9a8a", letterSpacing: 2 }}>
                        CONFIDENCE: <span style={{ color: result.label === 1 ? "#ff4444" : "#00ff88", fontSize: 14 }}>
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      {/* confidence bar */}
                      <div style={{ marginTop: 12, height: 6, borderRadius: 3, background: "#0a1a12", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 3, transition: "width 0.8s ease",
                          width: `${result.confidence * 100}%`,
                          background: result.label === 1 ? "linear-gradient(90deg, #ff4444, #ff8888)" : "linear-gradient(90deg, #00cc6a, #00ff88)"
                        }} />
                      </div>
                    </div>

                    {/* FEATURE SCORES */}
                    <div style={{ fontSize: 10, letterSpacing: 3, color: "#4a8a6a", marginBottom: 10 }}>FEATURE ANALYSIS</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {result.features.slice(0, 8).map((v, i) => {
                        const max = 2; const pct = Math.min(v / max * 100, 100);
                        const isHigh = v > 0.3;
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 120, fontSize: 9, color: "#5a7a6a", letterSpacing: 1, flexShrink: 0 }}>
                              {FEATURE_NAMES[i]}
                            </div>
                            <div style={{ flex: 1, height: 5, borderRadius: 2, background: "#0a1a12", overflow: "hidden" }}>
                              <div style={{
                                height: "100%", width: `${pct}%`, borderRadius: 2,
                                background: isHigh ? "#ff4444" : "#1a5a3a", transition: "width 0.6s ease"
                              }} />
                            </div>
                            <div style={{ width: 32, fontSize: 9, color: isHigh ? "#ff6666" : "#3a6a4a", textAlign: "right" }}>
                              {v.toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!result && !scanLine && (
                  <div style={{
                    height: "100%", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 12, opacity: 0.4
                  }}>
                    <div style={{ fontSize: 52 }}>📧</div>
                    <div style={{ fontSize: 11, letterSpacing: 3, color: "#4a8a6a", textAlign: "center" }}>
                      ENTER EMAIL CONTENT<br />OR LOAD A SAMPLE
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODEL TAB */}
        {activeTab === "model" && (
          <div style={{ opacity: animIn ? 1 : 0, transition: "all 0.5s" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { label: "ACCURACY", value: `${(trainResults.accuracy * 100).toFixed(1)}%`, color: "#00ff88" },
                { label: "PRECISION", value: `${(precision * 100).toFixed(1)}%`, color: "#00ccff" },
                { label: "RECALL", value: `${(recall * 100).toFixed(1)}%`, color: "#ffaa00" },
                { label: "F1 SCORE", value: `${(f1 * 100).toFixed(1)}%`, color: "#ff88cc" },
              ].map(m => (
                <div key={m.label} style={{
                  padding: "18px", borderRadius: 8, textAlign: "center",
                  background: "rgba(0,255,136,0.04)", border: "1px solid #0f3a28"
                }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: "#4a8a6a", marginBottom: 8 }}>{m.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* CONFUSION MATRIX */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#4a8a6a", marginBottom: 14 }}>CONFUSION MATRIX</div>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: 2, fontSize: 11 }}>
                  <div></div>
                  <div style={{ padding: "8px", textAlign: "center", color: "#00ff88", letterSpacing: 2, fontSize: 9 }}>PRED SAFE</div>
                  <div style={{ padding: "8px", textAlign: "center", color: "#ff4444", letterSpacing: 2, fontSize: 9 }}>PRED PHISH</div>
                  <div style={{ padding: "8px", color: "#00ff88", fontSize: 9, letterSpacing: 2, display: "flex", alignItems: "center" }}>ACT SAFE</div>
                  <div style={{ padding: "20px", textAlign: "center", background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 6, fontSize: 22, fontWeight: 700, color: "#00ff88" }}>
                    {trainResults.cm[0][0]}
                    <div style={{ fontSize: 9, color: "#4a8a6a", marginTop: 4 }}>TRUE NEG</div>
                  </div>
                  <div style={{ padding: "20px", textAlign: "center", background: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: 6, fontSize: 22, fontWeight: 700, color: "#ff6666" }}>
                    {trainResults.cm[0][1]}
                    <div style={{ fontSize: 9, color: "#4a8a6a", marginTop: 4 }}>FALSE POS</div>
                  </div>
                  <div style={{ padding: "8px", color: "#ff4444", fontSize: 9, letterSpacing: 2, display: "flex", alignItems: "center" }}>ACT PHISH</div>
                  <div style={{ padding: "20px", textAlign: "center", background: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: 6, fontSize: 22, fontWeight: 700, color: "#ff6666" }}>
                    {trainResults.cm[1][0]}
                    <div style={{ fontSize: 9, color: "#4a8a6a", marginTop: 4 }}>FALSE NEG</div>
                  </div>
                  <div style={{ padding: "20px", textAlign: "center", background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 6, fontSize: 22, fontWeight: 700, color: "#00ff88" }}>
                    {trainResults.cm[1][1]}
                    <div style={{ fontSize: 9, color: "#4a8a6a", marginTop: 4 }}>TRUE POS</div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#4a8a6a", marginBottom: 14 }}>FEATURE IMPORTANCE</div>
                {classifier.featureImportance.slice(0, 8).map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 130, fontSize: 9, color: "#5a7a6a", letterSpacing: 1 }}>{FEATURE_NAMES[f.index]}</div>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#0a1a12", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 4,
                        width: `${Math.min(f.importance / 2 * 100, 100)}%`,
                        background: `hsl(${140 - i * 15}, 70%, 50%)`
                      }} />
                    </div>
                    <div style={{ width: 36, fontSize: 9, color: "#3a6a4a", textAlign: "right" }}>
                      {f.importance.toFixed(3)}
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 18, padding: "14px", borderRadius: 6, background: "rgba(0,255,136,0.04)", border: "1px solid #0f3a28" }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: "#4a8a6a", marginBottom: 8 }}>ALGORITHM</div>
                  <div style={{ fontSize: 11, color: "#7a9a8a", lineHeight: 1.7 }}>
                    Gaussian Naïve Bayes with Gaussian likelihood per feature.<br />
                    12 hand-crafted features extracted from subject + body.<br />
                    Trained on {DATASET.length} labeled emails ({DATASET.filter(d=>d.label===1).length} phishing / {DATASET.filter(d=>d.label===0).length} safe).
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DATASET TAB */}
        {activeTab === "dataset" && (
          <div style={{ opacity: animIn ? 1 : 0, transition: "all 0.5s" }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ padding: "12px 20px", borderRadius: 6, background: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,50,50,0.3)" }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#ff4444" }}>PHISHING</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#ff4444" }}>{DATASET.filter(d=>d.label===1).length}</div>
              </div>
              <div style={{ padding: "12px 20px", borderRadius: 6, background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.3)" }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#00ff88" }}>SAFE</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#00ff88" }}>{DATASET.filter(d=>d.label===0).length}</div>
              </div>
              <div style={{ padding: "12px 20px", borderRadius: 6, background: "rgba(0,200,255,0.06)", border: "1px solid rgba(0,200,255,0.3)" }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#00ccff" }}>TOTAL</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#00ccff" }}>{DATASET.length}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 480, overflowY: "auto", paddingRight: 6 }}>
              {DATASET.map((d, i) => (
                <div key={i} style={{
                  padding: "10px 14px", borderRadius: 6, cursor: "pointer",
                  background: d.label === 1 ? "rgba(255,50,50,0.05)" : "rgba(0,255,136,0.03)",
                  border: d.label === 1 ? "1px solid rgba(255,50,50,0.2)" : "1px solid rgba(0,255,136,0.15)",
                  transition: "all 0.2s"
                }} onClick={() => { loadSample({subject: d.subject, body: d.body, label: d.label === 1 ? "Phishing" : "Safe"}); setActiveTab("detect"); }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{
                      padding: "2px 8px", borderRadius: 3, fontSize: 8, letterSpacing: 2, flexShrink: 0,
                      background: d.label === 1 ? "rgba(255,50,50,0.2)" : "rgba(0,255,136,0.15)",
                      color: d.label === 1 ? "#ff4444" : "#00ff88"
                    }}>{d.label === 1 ? "PHISH" : "SAFE"}</div>
                    <div style={{ fontSize: 12, color: "#c8d8e8", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{d.subject}</div>
                  </div>
                  <div style={{ fontSize: 10, color: "#4a6a5a", marginTop: 4, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{d.body}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: "#2a5a3a", letterSpacing: 2 }}>
              ↑ CLICK ANY ENTRY TO LOAD IT INTO THE DETECTOR
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #050b12; }
        ::-webkit-scrollbar-thumb { background: #0f3a28; border-radius: 2px; }
      `}</style>
    </div>
  );
}
