
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AboutUs() {
  const team = [
    {
      name: "Alexandre Moreau",
      role: "CEO & Fondateur",
      image: "/placeholder.svg",
      bio: "Ancien entrepreneur et business angel, Alexandre a fondé Efficio pour aider les entrepreneurs à éviter les erreurs qu'il a lui-même commises dans ses précédentes aventures."
    },
    {
      name: "Sophie Martin",
      role: "Directrice Financière",
      image: "/placeholder.svg",
      bio: "Avec 12 ans d'expérience dans le capital-risque, Sophie apporte son expertise pour guider les entrepreneurs dans leur stratégie de levée de fonds."
    },
    {
      name: "Thomas Nguyen",
      role: "Responsable Contenu",
      image: "/placeholder.svg",
      bio: "Thomas veille à ce que nos ressources et guides soient constamment à jour et reflètent les meilleures pratiques du secteur."
    },
    {
      name: "Maria Rodriguez",
      role: "Experte Juridique",
      image: "/placeholder.svg",
      bio: "Spécialiste en droit des affaires, Maria contribue aux ressources juridiques et accompagne les entrepreneurs sur les questions de structuration."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Notre Équipe</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Nous sommes des entrepreneurs et experts qui se sont réunis avec une mission commune : faciliter le parcours entrepreneurial et démocratiser l'accès au financement.
          </p>
        </div>
        
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">Notre Histoire</h2>
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <p className="text-white/80 mb-4">
              Efficio est né d'un constat simple : trop d'entrepreneurs talentueux abandonnent leurs projets par manque d'accompagnement structuré et de ressources accessibles.
            </p>
            <p className="text-white/80">
              Lancée en 2021, notre plateforme a rapidement gagné la confiance des entrepreneurs et organismes de financement. Notre approche holistique du parcours entrepreneurial, de l'idée au financement, nous a permis d'accompagner plus de 800 startups dans leur développement.
            </p>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-6">L'Équipe Efficio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={member.image} alt={member.name} />
                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-primary mb-3">{member.role}</p>
                <p className="text-white/70 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
