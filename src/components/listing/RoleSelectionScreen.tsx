import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, User, Check } from "lucide-react";

interface RoleSelectionScreenProps {
  onRoleSelected: (role: 'individual' | 'agency') => void;
  selectedRole?: 'individual' | 'agency';
}

export const RoleSelectionScreen = ({ onRoleSelected, selectedRole = 'individual' }: RoleSelectionScreenProps) => {
  const [currentRole, setCurrentRole] = useState<'individual' | 'agency'>(selectedRole);

  const roles = [
    {
      id: 'individual' as const,
      title: 'I am an Individual Lister',
      description: 'Sharing my own room or apartment with flatmates',
      icon: User,
      features: [
        'List your own room or apartment',
        'Connect with potential flatmates',
        'Simple verification process',
        'Personal profile showcase'
      ]
    },
    {
      id: 'agency' as const,
      title: 'I am an Agency / Property Manager',
      description: 'Managing multiple properties professionally',
      icon: Building2,
      features: [
        'Manage multiple listings',
        'Agency branding and profile',
        'Advanced analytics and reporting',
        'Bulk property management tools'
      ]
    }
  ];

  const handleContinue = () => {
    onRoleSelected(currentRole);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choose Your Account Type</h1>
        <p className="text-muted-foreground text-lg">
          Help us customize your experience on Hommi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = currentRole === role.id;
          
          return (
            <Card 
              key={role.id}
              className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-primary border-primary bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setCurrentRole(role.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{role.title}</h3>
                    {isSelected && (
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4">
                    {role.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Button 
          onClick={handleContinue}
          size="lg"
          variant="hero"
          className="px-8"
        >
          Continue as {currentRole === 'individual' ? 'Individual' : 'Agency'}
        </Button>
        
        <p className="text-xs text-muted-foreground mt-4">
          You can change this later in your account settings
        </p>
      </div>
    </div>
  );
};