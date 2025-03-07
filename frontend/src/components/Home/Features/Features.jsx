import { Rocket, Shield, Wrench, BarChart3, Cloud, Users } from 'lucide-react';
import './Features.css';

const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      icon: Rocket,
      title: "Lightning Fast Performance",
      description: "Our optimized platform ensures your applications run at peak performance with minimal load times.",
    },
    {
      id: 2,
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "Bank-level encryption and security protocols keep your data safe and protected at all times.",
    },
    {
      id: 3,
      icon: Wrench,
      title: "Powerful Developer Tools",
      description: "A comprehensive suite of development tools designed to streamline your workflow and boost productivity.",
    },
    {
      id: 4,
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Gain valuable insights with our detailed analytics dashboard and customizable reporting tools.",
    },
    {
      id: 5,
      icon: Cloud,
      title: "Seamless Cloud Integration",
      description: "Connect with all major cloud providers for flexible deployment and scaling options.",
    },
    {
      id: 6,
      icon: Users,
      title: "Collaborative Workspace",
      description: "Work together in real-time with team members across the globe with our collaborative features.",
    },
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2>Our Powerful Features</h2>
          <p>Discover why thousands of developers and businesses choose our platform</p>
        </div>

        <div className="features-grid">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div className="feature-card" key={feature.id}>
                <div className="feature-icon">
                  <IconComponent size={24} strokeWidth={1.5} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;