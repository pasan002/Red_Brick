import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Executive Team Images
import lahiruImg from "../assets/images/Lahiru.png";
import chathumImg from "../assets/images/Chathum.jpg";
import udeshImg from "../assets/images/Udesh.jpg";
import sayuriImg from "../assets/images/Sayuri.jpg";
import amalImg from "../assets/images/Amal.jpg";
import erandaImg from "../assets/images/Eranda.jpg";
import pankajaImg from "../assets/images/Pankaja.jpg";

// Labour Team Images
import champikaImg from "../assets/images/Champika.png";
import rathnasiriImg from "../assets/images/Rathnasiri-MasonHead.png";
import chandrasomaImg from "../assets/images/Chandrasoma.png";
import ganeshanImg from "../assets/images/Ganeshan.png";
import kalenImg from "../assets/images/Kalen.png";
import kumaraImg from "../assets/images/Kumara.png";
import kumaraMasonImg from "../assets/images/Kumara-Mason.png";
import nandasenaImg from "../assets/images/Nandasena-Mason.png";
import nishshankaImg from "../assets/images/Nishshanka-Painter.png";
import rajaImg from "../assets/images/Raja.png";
import sisiraImg from "../assets/images/Sisira-Mason.png";
import thusharaImg from "../assets/images/Thushara-Mason-Painter.png";

function TeamPage() {
  // Executive team members data
  const executiveTeam = [
    { name: "Lahiru Thilakarathna", position: "Founder CEO", image: lahiruImg },
    { name: "Chathum Wanniarachchi", position: "Director", image: chathumImg },
    { name: "Udesh Gamage", position: "Director", image: udeshImg },
    { name: "Sayuri Narmada", position: "Project Coordinator", image: sayuriImg },
    { name: "Amal Sugathadasa", position: "Site Manager", image: amalImg },
    { name: "Eranda Beddage", position: "Site Manager", image: erandaImg },
    { name: "Pankaja Siriwardana", position: "Marketing Executive", image: pankajaImg },
  ];

  // Labour team members data
  const labourTeam = [
    { name: "Champika", position: "", image: champikaImg },
    { name: "Rathnasiri", position: "", image: rathnasiriImg },
    { name: "Chandrasoma", position: "", image: chandrasomaImg },
    { name: "Ganeshan", position: "", image: ganeshanImg },
    { name: "Kalen", position: "", image: kalenImg },
    { name: "Kumara", position: "", image: kumaraImg },
    { name: "Kumara", position: "", image: kumaraMasonImg },
    { name: "Nandasena", position: "", image: nandasenaImg },
    { name: "Nishshanka", position: "", image: nishshankaImg },
    { name: "Raja", position: "", image: rajaImg },
    { name: "Sisira", position: "", image: sisiraImg },
    { name: "Thushara", position: "", image: thusharaImg },
  ];

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#6b1d1e] mb-4">We are Redbrick Homes</h1>
          <p className="text-xl text-gray-600 mb-8">Our dedicated team works tirelessly to provide the best value for your project</p>
          
          <p className="text-justify text-gray-600 leading-relaxed mb-12">
            Every construction project is unique and requires a specialized team that can deliver outstanding results with unwavering trust.
            We proudly provide a 25 year structural warranty for your project, a testament to our use of industry-standard materials
            endorsed by numerous engineers. Building requires a one-of-a-kind approach and a team with the expertise to execute it
            flawlessly. With a 25-year structural warranty as a standard feature in our practice, we demonstrate our commitment to using
            industry-approved materials, trusted by engineers in all our construction work.
          </p>
        </div>

        {/* Executive Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-[#6b1d1e] mb-10">Meet the Executive Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {executiveTeam.map((member, index) => (
              <div key={index} className="mb-10">
                <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-4 border-2 border-gray-100 shadow-md">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-1">{member.name}</h4>
                <p className="text-gray-600">{member.position}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Labour Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-[#6b1d1e] mb-10">Meet the Labour Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {labourTeam.map((member, index) => (
              <div key={index} className="mb-10">
                <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-4 border-2 border-gray-100 shadow-md">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-1">{member.name}</h4>
                {member.position && <p className="text-gray-600">{member.position}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default TeamPage; 