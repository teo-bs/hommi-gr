import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { designTokens } from "@/constants/design-tokens";
import { 
  Palette, 
  Type, 
  Ruler, 
  Layout, 
  Component,
  Search,
  Heart,
  Home,
  Shield,
  Star,
  Users,
  Plus,
  Trash2,
  Edit,
  Check
} from "lucide-react";

const DesignSystem = () => {
  const [activeChip, setActiveChip] = useState(false);

  // Color palette from CSS variables
  const colorPalette = [
    { name: "Primary", var: "--primary", desc: "Main brand color" },
    { name: "Primary Hover", var: "--primary-hover", desc: "Primary hover state" },
    { name: "Secondary", var: "--secondary", desc: "Secondary UI elements" },
    { name: "Accent", var: "--accent", desc: "Accent color" },
    { name: "Success", var: "--success", desc: "Success states" },
    { name: "Warning", var: "--warning", desc: "Warning states" },
    { name: "Destructive", var: "--destructive", desc: "Error/destructive states" },
    { name: "Muted", var: "--muted", desc: "Muted backgrounds" },
    { name: "Background", var: "--background", desc: "Page background" },
    { name: "Foreground", var: "--foreground", desc: "Text color" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Section spacing="compact" className="bg-gradient-to-br from-primary/10 via-accent/5 to-background border-b">
        <Container>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Component className="h-10 w-10 text-primary" />
              <h1 className="text-h1 font-bold">Hommi Design System</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A comprehensive guide to Hommi's design language, components, and usage guidelines
            </p>
          </div>
        </Container>
      </Section>

      <Container className="py-12">
        <Tabs defaultValue="colors" className="space-y-12">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 h-auto">
            <TabsTrigger value="colors" className="flex-col gap-2 py-3">
              <Palette className="h-5 w-5" />
              <span className="text-xs">Colors</span>
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex-col gap-2 py-3">
              <Type className="h-5 w-5" />
              <span className="text-xs">Typography</span>
            </TabsTrigger>
            <TabsTrigger value="spacing" className="flex-col gap-2 py-3">
              <Ruler className="h-5 w-5" />
              <span className="text-xs">Spacing</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex-col gap-2 py-3">
              <Layout className="h-5 w-5" />
              <span className="text-xs">Layout</span>
            </TabsTrigger>
            <TabsTrigger value="components" className="flex-col gap-2 py-3">
              <Component className="h-5 w-5" />
              <span className="text-xs">Components</span>
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-12">
            <div>
              <h2 className="text-h2 font-bold mb-2">Color Palette</h2>
              <p className="text-muted-foreground mb-8">
                Our Mediterranean-inspired color system using HSL values for consistency across light and dark modes
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {colorPalette.map((color) => (
                  <Card key={color.name} variant="interactive">
                    <CardContent className="p-6">
                      <div 
                        className="w-full h-24 rounded-lg mb-4 border shadow-sm"
                        style={{ backgroundColor: `hsl(var(${color.var}))` }}
                      />
                      <h3 className="font-semibold text-lg mb-1">{color.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{color.desc}</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        hsl(var({color.var}))
                      </code>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-h3 font-bold mb-6">Usage Guidelines</h3>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      Do
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                      <li>• Always use semantic color tokens (e.g., <code className="bg-muted px-1 rounded">bg-primary</code>)</li>
                      <li>• Use HSL format for all colors</li>
                      <li>• Ensure WCAG 2.1 AA contrast ratios (4.5:1 for text)</li>
                      <li>• Test colors in both light and dark modes</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-destructive" />
                      Don't
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                      <li>• Never use direct color values like <code className="bg-muted px-1 rounded line-through">text-white</code> or <code className="bg-muted px-1 rounded line-through">bg-black</code></li>
                      <li>• Avoid RGB or HEX colors in components</li>
                      <li>• Don't create custom colors outside the design system</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-12">
            <div>
              <h2 className="text-h2 font-bold mb-2">Typography Scale</h2>
              <p className="text-muted-foreground mb-8">
                Consistent type hierarchy for clear visual communication
              </p>

              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <h1 className="text-h1 font-bold">Heading 1 (h1)</h1>
                    <code className="text-xs bg-muted px-2 py-1 rounded">text-h1 font-bold</code>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h2 className="text-h2 font-bold">Heading 2 (h2)</h2>
                    <code className="text-xs bg-muted px-2 py-1 rounded">text-h2 font-bold</code>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-h3 font-semibold">Heading 3 (h3)</h3>
                    <code className="text-xs bg-muted px-2 py-1 rounded">text-h3 font-semibold</code>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="text-xl">Large Text (xl)</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">text-xl</code>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="text-base">Body Text (base)</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">text-base</code>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="text-small">Small Text (small)</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">text-small</code>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="text-micro">Micro Text (micro)</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">text-micro</code>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-h3 font-bold mb-6">Font Weights</h3>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-normal">Normal (400)</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">font-normal</code>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Medium (500)</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">font-medium</code>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Semibold (600)</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">font-semibold</code>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Bold (700)</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">font-bold</code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Spacing Tab */}
          <TabsContent value="spacing" className="space-y-12">
            <div>
              <h2 className="text-h2 font-bold mb-2">Spacing Scale</h2>
              <p className="text-muted-foreground mb-8">
                Consistent spacing tokens for layouts, components, and visual hierarchy
              </p>

              <Card>
                <CardContent className="p-6 space-y-6">
                  {Object.entries(designTokens.spacing).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4">
                      <div 
                        className="bg-primary h-8 rounded"
                        style={{ width: value }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{key}</div>
                        <code className="text-xs text-muted-foreground">{value}</code>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-h3 font-bold mb-6">Touch Targets</h3>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    All interactive elements must meet WCAG 2.1 AA minimum touch target size of 44x44px
                  </p>
                  {Object.entries(designTokens.size).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4">
                      <div 
                        className="bg-accent flex items-center justify-center rounded text-accent-foreground font-semibold text-xs"
                        style={{ width: value, height: value }}
                      >
                        {value}
                      </div>
                      <div>
                        <div className="font-semibold">{key}</div>
                        <code className="text-xs text-muted-foreground">{value}</code>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-12">
            <div>
              <h2 className="text-h2 font-bold mb-2">Layout Components</h2>
              <p className="text-muted-foreground mb-8">
                Standardized layout containers for consistent spacing and widths
              </p>
            </div>

            <div>
              <h3 className="text-h3 font-bold mb-4">Container</h3>
              <Card className="mb-6">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">
                    Container component provides consistent max-width and horizontal padding
                  </p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{`<Container size="default">
  {/* Your content */}
</Container>

// Sizes: "narrow" | "default" | "wide"
// narrow: max-w-4xl
// default: max-w-7xl  
// wide: max-w-[1440px]`}</code>
                  </pre>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card variant="interactive">
                  <CardContent className="p-4 bg-primary/10">
                    <div className="bg-primary/20 p-4 rounded border-2 border-dashed border-primary">
                      <code className="text-sm">Container size="narrow"</code>
                    </div>
                  </CardContent>
                </Card>
                
                <Card variant="interactive">
                  <CardContent className="p-4 bg-accent/10">
                    <div className="bg-accent/20 p-4 rounded border-2 border-dashed border-accent">
                      <code className="text-sm">Container size="default"</code>
                    </div>
                  </CardContent>
                </Card>
                
                <Card variant="interactive">
                  <CardContent className="p-4 bg-success/10">
                    <div className="bg-success/20 p-4 rounded border-2 border-dashed border-success">
                      <code className="text-sm">Container size="wide"</code>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-h3 font-bold mb-4">Section</h3>
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">
                    Section component provides consistent vertical spacing
                  </p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{`<Section spacing="default">
  <Container>
    {/* Your content */}
  </Container>
</Section>

// Spacing options:
// "compact": py-8 sm:py-12
// "default": py-12 sm:py-16 md:py-20
// "relaxed": py-16 sm:py-20 md:py-24`}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-12">
            {/* Buttons */}
            <div>
              <h2 className="text-h2 font-bold mb-4">Buttons</h2>
              <Card className="mb-6">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h4 className="font-semibold mb-4">Core Variants</h4>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="default">Default (Primary)</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-4">Utility Variants</h4>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="link">Link</Button>
                      <Button variant="hero">Hero</Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-4">Sizes</h4>
                    <div className="flex flex-wrap items-center gap-4">
                      <Button size="sm">Small (40px)</Button>
                      <Button size="default">Default (44px)</Button>
                      <Button size="lg">Large (48px)</Button>
                      <Button size="icon"><Search className="h-5 w-5" /></Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-4">With Icons</h4>
                    <div className="flex flex-wrap gap-4">
                      <Button>
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </Button>
                      <Button variant="secondary">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">Usage Example</h4>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{`import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

<Button variant="default" size="lg">
  <Search className="mr-2 h-4 w-4" />
  Search Listings
</Button>`}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>

            {/* Chips */}
            <div>
              <h2 className="text-h2 font-bold mb-4">Chips</h2>
              <Card className="mb-6">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h4 className="font-semibold mb-4">Filter Chips (Interactive)</h4>
                    <div className="flex flex-wrap gap-3">
                      <Chip 
                        variant="filter" 
                        active={activeChip} 
                        onClick={() => setActiveChip(!activeChip)}
                        onRemove={() => setActiveChip(false)}
                      >
                        Toggleable Filter
                      </Chip>
                      <Chip variant="filter" icon={Users}>With Icon</Chip>
                      <Chip variant="filter" icon={Heart}>Couples</Chip>
                      <Chip variant="filter" icon={Home}>Pets OK</Chip>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-4">Badges (Status)</h4>
                    <div className="flex flex-wrap gap-3">
                      <Chip variant="badge" colorScheme="default">Default</Chip>
                      <Chip variant="badge" colorScheme="primary">Primary</Chip>
                      <Chip variant="badge" colorScheme="success">Success</Chip>
                      <Chip variant="badge" colorScheme="warning">Warning</Chip>
                      <Chip variant="badge" colorScheme="destructive">Error</Chip>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-4">Tags</h4>
                    <div className="flex flex-wrap gap-3">
                      <Chip variant="tag" colorScheme="outline">Category</Chip>
                      <Chip variant="tag" colorScheme="outline" removable onRemove={() => {}}>Removable</Chip>
                      <Chip variant="tag" colorScheme="primary">Featured</Chip>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">Usage Example</h4>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{`import { Chip } from "@/components/ui/chip";
import { Users } from "lucide-react";

<Chip 
  variant="filter" 
  icon={Users}
  active={isActive}
  onClick={() => toggle()}
  onRemove={() => remove()}
>
  Shared Homes
</Chip>`}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>

            {/* Badges */}
            <div>
              <h2 className="text-h2 font-bold mb-4">Badges</h2>
              <Card className="mb-6">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cards */}
            <div>
              <h2 className="text-h2 font-bold mb-4">Cards</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Default Card</CardTitle>
                    <CardDescription>Standard card styling</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Use for static content and information display
                    </p>
                  </CardContent>
                </Card>

                <Card variant="interactive">
                  <CardHeader>
                    <CardTitle>Interactive Card</CardTitle>
                    <CardDescription>Hover for effect</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Use for clickable cards and listings
                    </p>
                  </CardContent>
                </Card>

                <Card variant="hero">
                  <CardHeader>
                    <CardTitle>Hero Card</CardTitle>
                    <CardDescription>Glassmorphism style</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Use for landing page features
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">Usage Example</h4>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{`import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card variant="interactive">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>`}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
};

export default DesignSystem;
