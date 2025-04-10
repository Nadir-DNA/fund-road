
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CapTableProps {
  stepId: number;
  substepTitle: string;
}

interface Shareholder {
  id: string;
  name: string;
  shares: number;
  initialShares: number;
  percentage: number;
}

interface Investment {
  amount: number;
  valuation: number;
  shares: number;
  investor: string;
}

export default function CapTable({ stepId, substepTitle }: CapTableProps) {
  const [shareholders, setShareholders] = useState<Shareholder[]>([
    { id: "1", name: "Fondateur 1", shares: 70, initialShares: 70, percentage: 70 },
    { id: "2", name: "Fondateur 2", shares: 30, initialShares: 30, percentage: 30 }
  ]);
  
  const [newInvestment, setNewInvestment] = useState<Investment>({
    amount: 100000,
    valuation: 1000000,
    shares: 10, // Will be calculated
    investor: "Business Angel"
  });
  
  const [investmentHistory, setInvestmentHistory] = useState<Investment[]>([]);
  
  const [simulationActive, setSimulationActive] = useState(false);

  const addShareholder = () => {
    const id = (shareholders.length + 1).toString();
    setShareholders([...shareholders, { 
      id, 
      name: `Actionnaire ${id}`, 
      shares: 0,
      initialShares: 0,
      percentage: 0
    }]);
  };

  const removeShareholder = (id: string) => {
    setShareholders(shareholders.filter(s => s.id !== id));
    recalculatePercentages(shareholders.filter(s => s.id !== id));
  };

  const updateShareholderValue = (id: string, field: keyof Shareholder, value: string) => {
    const updatedShareholders = shareholders.map(s => {
      if (s.id === id) {
        const updatedShareholder = { ...s, [field]: field === 'name' ? value : parseInt(value) || 0 };
        if (field === 'shares') {
          updatedShareholder.initialShares = parseInt(value) || 0;
        }
        return updatedShareholder;
      }
      return s;
    });
    
    setShareholders(updatedShareholders);
    recalculatePercentages(updatedShareholders);
  };

  const recalculatePercentages = (shareholders: Shareholder[]) => {
    const totalShares = shareholders.reduce((sum, s) => sum + s.shares, 0);
    
    if (totalShares === 0) return shareholders;
    
    return setShareholders(shareholders.map(s => ({
      ...s,
      percentage: Number(((s.shares / totalShares) * 100).toFixed(2))
    })));
  };

  const updateInvestmentValue = (field: keyof Investment, value: string) => {
    setNewInvestment({
      ...newInvestment,
      [field]: field === 'investor' ? value : parseInt(value) || 0
    });
  };

  const simulateInvestment = () => {
    // Calculate new shares to issue
    const { amount, valuation, investor } = newInvestment;
    const totalShares = shareholders.reduce((sum, s) => sum + s.shares, 0);
    const existingValuation = valuation - amount;
    const sharePrice = existingValuation / totalShares;
    const newShares = Math.round(amount / sharePrice);
    
    // Create investment record with calculated shares
    const investment = {
      ...newInvestment,
      shares: newShares
    };
    
    // Add to history
    setInvestmentHistory([...investmentHistory, investment]);
    
    // Dilute existing shareholders
    const totalSharesAfterInvestment = totalShares + newShares;
    const dilutedShareholders = shareholders.map(s => ({
      ...s,
      percentage: Number(((s.shares / totalSharesAfterInvestment) * 100).toFixed(2))
    }));
    
    // Add investor
    const newShareholder = {
      id: `inv-${investmentHistory.length + 1}`,
      name: investor,
      shares: newShares,
      initialShares: newShares,
      percentage: Number(((newShares / totalSharesAfterInvestment) * 100).toFixed(2))
    };
    
    setShareholders([...dilutedShareholders, newShareholder]);
    setSimulationActive(true);
  };

  const resetSimulation = () => {
    // Reset to initial state
    const initialShareholders = shareholders
      .filter(s => !s.id.startsWith('inv-'))
      .map(s => ({
        ...s,
        shares: s.initialShares
      }));
    
    setInvestmentHistory([]);
    setShareholders(initialShareholders);
    recalculatePercentages(initialShareholders);
    setSimulationActive(false);
  };

  const totalShares = shareholders.reduce((sum, s) => sum + s.shares, 0);
  const totalPercentage = shareholders.reduce((sum, s) => sum + s.percentage, 0);

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="cap_table"
      title="Table de Capitalisation et Simulation de Dilution"
      description="Gérez la répartition du capital et simulez l'impact des levées de fonds"
      defaultValues={{ shareholders, investmentHistory }}
      onDataSaved={data => {
        if (data.shareholders) setShareholders(data.shareholders);
        if (data.investmentHistory) setInvestmentHistory(data.investmentHistory);
      }}
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Table de Capitalisation</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addShareholder}
            >
              <Plus className="mr-1 h-4 w-4" />
              Ajouter un actionnaire
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="text-right">Nombre d'actions</TableHead>
                  <TableHead className="text-right">Pourcentage</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shareholders.map(shareholder => (
                  <TableRow key={shareholder.id}>
                    <TableCell>
                      <Input
                        value={shareholder.name}
                        onChange={(e) => updateShareholderValue(shareholder.id, 'name', e.target.value)}
                        className="border-none px-0 py-0 focus-visible:ring-0"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        value={shareholder.shares}
                        onChange={(e) => updateShareholderValue(shareholder.id, 'shares', e.target.value)}
                        type="number"
                        min="0"
                        className="w-24 text-right border-none px-0 py-0 focus-visible:ring-0 ml-auto"
                        disabled={simulationActive && shareholder.id.startsWith('inv-')}
                      />
                    </TableCell>
                    <TableCell className="text-right">{shareholder.percentage}%</TableCell>
                    <TableCell>
                      {!shareholder.id.startsWith('inv-') && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeShareholder(shareholder.id)}
                          disabled={shareholders.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-medium">Total</TableCell>
                  <TableCell className="text-right font-medium">{totalShares}</TableCell>
                  <TableCell className="text-right font-medium">{totalPercentage.toFixed(2)}%</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Simulateur de dilution</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="investmentAmount">Montant de l'investissement (€)</Label>
                <Input
                  id="investmentAmount"
                  value={newInvestment.amount}
                  onChange={(e) => updateInvestmentValue('amount', e.target.value)}
                  type="number"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="companyValuation">Valorisation pre-money (€)</Label>
                <Input
                  id="companyValuation"
                  value={newInvestment.valuation}
                  onChange={(e) => updateInvestmentValue('valuation', e.target.value)}
                  type="number"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="investorName">Nom de l'investisseur</Label>
                <Input
                  id="investorName"
                  value={newInvestment.investor}
                  onChange={(e) => updateInvestmentValue('investor', e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={simulateInvestment}
                  className="flex-1"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Simuler l'investissement
                </Button>
                
                {simulationActive && (
                  <Button
                    variant="outline"
                    onClick={resetSimulation}
                  >
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Historique des investissements</h4>
              {investmentHistory.length === 0 ? (
                <div className="text-sm text-muted-foreground border rounded-md p-4 text-center">
                  Aucun investissement simulé
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Investisseur</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {investmentHistory.map((inv, index) => (
                        <TableRow key={index}>
                          <TableCell>{inv.investor}</TableCell>
                          <TableCell className="text-right">{inv.amount.toLocaleString()} €</TableCell>
                          <TableCell className="text-right">{inv.shares}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ResourceForm>
  );
}
