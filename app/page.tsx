'use client';

import { useMemo, useState } from 'react';

export default function Home() {
  const [bill, setBill] = useState(3000);
  const [dayUse, setDayUse] = useState(60);
  const result = useMemo(() => {
    const monthlyKwh = bill / 4.2;
    const solarKwh = monthlyKwh * (dayUse / 100);
    const kwp = Math.max(1, solarKwh / 120);
    const size = Math.ceil(kwp * 2) / 2;
    const annual = size * 1450;
    const saving = Math.min(annual * 4.2, bill * 12 * dayUse / 100);
    const investment = size * 28000;
    return { size, annual, saving, investment, payback: investment / Math.max(saving, 1) };
  }, [bill, dayUse]);

  return <main>
    <nav><div className="brand"><span className="ves">VES</span><span className="dot"/> <b>Solar Calculate</b></div><a href="#calculator">เริ่มคำนวณ</a></nav>
    <section className="hero"><div><p className="eyebrow">VES SOLAR ENERGY</p><h1>คำนวณ Solar Rooftop<br/><span>ให้เหมาะกับการใช้ไฟของคุณ</span></h1><p>ประเมินขนาดระบบ ผลผลิตไฟฟ้า เงินประหยัด และระยะเวลาคืนทุนเบื้องต้นได้ภายในไม่กี่ขั้นตอน</p><a className="primary" href="#calculator">เริ่มคำนวณฟรี →</a></div><div className="sun"><div className="panel">☀<br/><strong>{result.size.toFixed(1)} kWp</strong><small>ระบบแนะนำเบื้องต้น</small></div></div></section>
    <section id="calculator" className="calculator"><div className="form"><p className="eyebrow">SOLAR CALCULATOR</p><h2>ข้อมูลการใช้ไฟฟ้า</h2><label>ค่าไฟเฉลี่ยต่อเดือน (บาท)<input type="number" value={bill} onChange={e=>setBill(Number(e.target.value))}/></label><label>สัดส่วนการใช้ไฟช่วงกลางวัน <b>{dayUse}%</b><input type="range" min="10" max="100" value={dayUse} onChange={e=>setDayUse(Number(e.target.value))}/></label><p className="hint">* ผลลัพธ์เป็นการประเมินเบื้องต้น สมมติค่าไฟเฉลี่ย 4.20 บาท/kWh และผลผลิตเฉลี่ย 1,450 kWh/kWp/ปี</p></div><div className="results"><p>ระบบที่แนะนำ</p><strong className="big">{result.size.toFixed(1)} <small>kWp</small></strong><div className="grid"><article><span>☀️ ผลิตไฟ/ปี</span><b>{Math.round(result.annual).toLocaleString()} kWh</b></article><article><span>💰 ประหยัด/ปี</span><b>฿{Math.round(result.saving).toLocaleString()}</b></article><article><span>🏗️ เงินลงทุนประมาณ</span><b>฿{Math.round(result.investment).toLocaleString()}</b></article><article><span>⏱️ คืนทุน</span><b>{result.payback.toFixed(1)} ปี</b></article></div><button>ดูผลวิเคราะห์ฉบับเต็ม</button></div></section>
    <section className="features"><h2>จากค่าไฟ สู่การตัดสินใจลงทุนที่ชัดเจน</h2><div><article>01<h3>Solar Sizing</h3><p>ประเมินขนาดติดตั้งที่สัมพันธ์กับพฤติกรรมการใช้ไฟ</p></article><article>02<h3>Energy Analysis</h3><p>ประมาณการพลังงานจากระบบ Solar Rooftop รายปี</p></article><article>03<h3>Financial Analysis</h3><p>ดูเงินประหยัด เงินลงทุน และระยะเวลาคืนทุน</p></article></div></section>
    <footer><b>VES Solar Calculate</b><span>V Engineering Solutions Co., Ltd. · www.vengineering.co.th</span></footer>
  </main>;
}
