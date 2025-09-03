import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, FileText, FileImage, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGlobalProgressTracker } from '@/hooks/useGlobalProgressTracker';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

interface GlobalReportGeneratorProps {
  className?: string;
}

export default function GlobalReportGenerator({ className }: GlobalReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { globalProgress } = useGlobalProgressTracker();

  const generateGlobalReport = async (format: 'pdf' | 'word') => {
    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour générer un rapport.",
          variant: "destructive"
        });
        return;
      }

      // Fetch all user resources
      const { data: userResources, error } = await supabase
        .from('user_resources')
        .select('*')
        .eq('user_id', user.id)
        .order('step_id', { ascending: true });

      if (error) {
        throw error;
      }

      if (!userResources || userResources.length === 0) {
        toast({
          title: "Aucune donnée",
          description: "Aucune ressource complétée trouvée.",
          variant: "destructive"
        });
        return;
      }

      const reportData = {
        title: "Rapport de Progression - Fund Road",
        date: new Date().toLocaleDateString('fr-FR'),
        user: user.email,
        totalProgress: globalProgress.progressPercentage,
        totalInputs: globalProgress.totalInputs,
        filledInputs: globalProgress.filledInputs,
        resources: userResources
      };

      if (format === 'pdf') {
        await generateGlobalPDF(reportData);
        toast({
          title: "Rapport PDF généré !",
          description: "Votre rapport complet a été téléchargé."
        });
      } else {
        await generateGlobalWord(reportData);
        toast({
          title: "Rapport Word généré !",
          description: "Votre rapport complet a été téléchargé."
        });
      }

    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer le rapport.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateGlobalPDF = async (reportData: any) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;
    let currentY = margin + 10;

    // Title page
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(reportData.title, margin, currentY);
    currentY += lineHeight * 3;

    // Summary information
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Utilisateur: ${reportData.user}`, margin, currentY);
    currentY += lineHeight;
    pdf.text(`Date de génération: ${reportData.date}`, margin, currentY);
    currentY += lineHeight;
    pdf.text(`Progression globale: ${Math.round(reportData.totalProgress)}%`, margin, currentY);
    currentY += lineHeight;
    pdf.text(`Champs complétés: ${reportData.filledInputs} / ${reportData.totalInputs}`, margin, currentY);
    currentY += lineHeight * 3;

    // Resources by step
    const resourcesByStep = reportData.resources.reduce((acc: any, resource: any) => {
      if (!acc[resource.step_id]) {
        acc[resource.step_id] = [];
      }
      acc[resource.step_id].push(resource);
      return acc;
    }, {});

    for (const [stepId, resources] of Object.entries(resourcesByStep)) {
      // Step title
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Étape ${stepId}`, margin, currentY);
      currentY += lineHeight * 2;

      for (const resource of resources as any[]) {
        // Check page break
        if (currentY > pageHeight - margin * 4) {
          pdf.addPage();
          currentY = margin + 10;
        }

        // Resource title
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${resource.substep_title} - ${resource.resource_type}`, margin, currentY);
        currentY += lineHeight;

        // Resource content
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        if (resource.content && typeof resource.content === 'object') {
          for (const [key, value] of Object.entries(resource.content)) {
            if (value && String(value).trim()) {
              const label = key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
              pdf.text(`${label}:`, margin, currentY);
              currentY += lineHeight;
              
              const lines = pdf.splitTextToSize(String(value), pageWidth - margin * 3);
              for (const line of lines) {
                if (currentY > pageHeight - margin * 2) {
                  pdf.addPage();
                  currentY = margin + 10;
                }
                pdf.text(line, margin + 10, currentY);
                currentY += lineHeight;
              }
              currentY += lineHeight * 0.5;
            }
          }
        }
        
        currentY += lineHeight;
      }
      
      currentY += lineHeight;
    }

    // Save
    const filename = `Fund_Road_Rapport_Complet_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  };

  const generateGlobalWord = async (reportData: any) => {
    const children = [];

    // Title
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: reportData.title,
            bold: true,
            size: 32
          })
        ],
        heading: HeadingLevel.TITLE
      })
    );

    // Summary
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Utilisateur: ${reportData.user}\nDate: ${reportData.date}\nProgression: ${Math.round(reportData.totalProgress)}%\nChamps: ${reportData.filledInputs}/${reportData.totalInputs}`,
            italics: true
          })
        ]
      })
    );

    children.push(new Paragraph({ children: [] }));

    // Resources by step
    const resourcesByStep = reportData.resources.reduce((acc: any, resource: any) => {
      if (!acc[resource.step_id]) {
        acc[resource.step_id] = [];
      }
      acc[resource.step_id].push(resource);
      return acc;
    }, {});

    for (const [stepId, resources] of Object.entries(resourcesByStep)) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Étape ${stepId}`,
              bold: true,
              size: 28
            })
          ],
          heading: HeadingLevel.HEADING_1
        })
      );

      for (const resource of resources as any[]) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${resource.substep_title} - ${resource.resource_type}`,
                bold: true,
                size: 24
              })
            ],
            heading: HeadingLevel.HEADING_2
          })
        );

        if (resource.content && typeof resource.content === 'object') {
          for (const [key, value] of Object.entries(resource.content)) {
            if (value && String(value).trim()) {
              const label = key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
              
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${label}:`,
                      bold: true
                    })
                  ]
                })
              );
              
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: String(value)
                    })
                  ]
                })
              );
              
              children.push(new Paragraph({ children: [] }));
            }
          }
        }
      }
    }

    const doc = new Document({
      sections: [{
        children
      }]
    });

    const buffer = await Packer.toBlob(doc);
    const url = URL.createObjectURL(buffer);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Fund_Road_Rapport_Complet_${new Date().toISOString().split('T')[0]}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Check if user has any completed resources
  const hasProgress = globalProgress.filledInputs > 0;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Rapport de progression complet</h3>
          <p className="text-sm text-muted-foreground">
            Téléchargez un rapport contenant toutes vos ressources complétées.
          </p>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Progression:</span>
              <span className="font-medium ml-2">{Math.round(globalProgress.progressPercentage)}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Champs complétés:</span>
              <span className="font-medium ml-2">{globalProgress.filledInputs}/{globalProgress.totalInputs}</span>
            </div>
          </div>
        </div>

        {hasProgress ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => generateGlobalReport('pdf')}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileImage className="h-4 w-4 mr-2" />
              )}
              Rapport PDF
            </Button>
            
            <Button
              variant="outline"
              onClick={() => generateGlobalReport('word')}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Rapport Word
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Commencez à compléter des ressources pour générer votre rapport.
          </p>
        )}
      </div>
    </Card>
  );
}