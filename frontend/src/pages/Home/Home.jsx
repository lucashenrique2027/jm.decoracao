import { useState } from 'react';
import Header from "../../components/Header/Header";
import SubHeader from "../../components/subHeader/subHeader";
import Footer from "../../components/Footer/Footer";
import Vitrine from "../../components/Vitrine/Vitrine";

export default function Home() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      <Header menuAberto={menuAberto} setMenuAberto={setMenuAberto} />
      <SubHeader />
      <Vitrine />
      <Footer />
    </>
  );
}