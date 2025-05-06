import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF', '#FF4560'];

export default function FinanceDashboard() {
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState('');
  const [goal, setGoal] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [tips, setTips] = useState('');

  const handleNext = () => {
    if (step === 0 && parseFloat(income) > 0) setStep(1);
    else if (step === 1 && parseFloat(goal) <= parseFloat(income)) setStep(2);
  };

  const addExpense = () => {
    if (expenseName && parseFloat(expenseAmount) > 0) {
      setExpenses([...expenses, { name: expenseName, value: parseFloat(expenseAmount) }]);
      setExpenseName('');
      setExpenseAmount('');
    }
  };

  const finishExpenses = async () => {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.value, 0);
    const actualSavings = Math.max(parseFloat(income) - totalExpenses, 0);
    const fullData = [...expenses, { name: 'Savings', value: actualSavings }];

    setStep(3);

    const res = await fetch('/api/tips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ income, goal, expenses })
    });
    const data = await res.json();
    setTips(data.tips);
  };

  return (
    <div className="max-w-xl mx-auto py-10 space-y-6">
      {step === 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <p>Enter your monthly income (after tax):</p>
            <Input value={income} onChange={e => setIncome(e.target.value)} placeholder="$3000" type="number" />
            <Button onClick={handleNext}>Next</Button>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <p>Enter your monthly savings goal:</p>
            <Input value={goal} onChange={e => setGoal(e.target.value)} placeholder="$500" type="number" />
            {parseFloat(goal) > parseFloat(income) && <p className="text-red-500">Goal exceeds income</p>}
            <Button onClick={handleNext}>Next</Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <p>Add an expense:</p>
            <Input value={expenseName} onChange={e => setExpenseName(e.target.value)} placeholder="Expense name" />
            <Input value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="$100" type="number" />
            <div className="flex gap-2">
              <Button onClick={addExpense}>Add</Button>
              <Button onClick={finishExpenses} variant="outline">Finish</Button>
            </div>
            <ul className="text-sm text-gray-600">
              {expenses.map((e, i) => (<li key={i}>{e.name}: ${e.value.toFixed(2)}</li>))}
            </ul>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-bold mb-2">Spending Distribution</h2>
              <PieChart width={300} height={300}>
                <Pie
                  data={expenses.concat({ name: 'Savings', value: Math.max(parseFloat(income) - expenses.reduce((sum, e) => sum + e.value, 0) || 0) })}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {expenses.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <Cell fill="#4CAF50" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-bold mb-2">AI Budgeting Tips</h2>
              <pre className="whitespace-pre-wrap text-sm">{tips}</pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}