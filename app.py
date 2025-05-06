import os
import openai
import matplotlib.pyplot as plt
import threading

def get_monthly_income():
    while True:
        try:
            income = float(input("Enter your monthly income (after tax): $"))
            if income < 0:
                raise ValueError
            return income
        except ValueError:
            print("Please enter a valid positive number.")

def get_savings_goal(income):
    while True:
        try:
            goal = float(input("Enter your monthly savings goal: $"))
            if goal < 0:
                raise ValueError
            if goal > income:
                print("Amount you want to save is higher than your monthly income.")
                continue
            return goal
        except ValueError:
            print("Please enter a valid positive number.")

def get_expenses():
    expenses = {}
    while True:
        name = input("Enter expense name (or type 'done' to finish): ").strip()
        if name.lower() == 'done':
            break
        try:
            amount = float(input(f"Enter amount for {name}: $"))
            if amount < 0:
                raise ValueError
            expenses[name] = expenses.get(name, 0) + amount
        except ValueError:
            print("Please enter a valid positive number.")
    return expenses

def plot_pie_chart(income, expenses, savings_goal):
    labels = list(expenses.keys()) + ['Savings']
    values = list(expenses.values())
    actual_savings = income - sum(values)
    values.append(max(actual_savings, 0))

    fig, ax = plt.subplots()
    ax.pie(values, labels=labels, autopct='%1.1f%%', startangle=90)
    ax.axis('equal')
    plt.title('Monthly Budget Distribution')
    plt.show()

def generate_gpt_tips(income, expenses, savings_goal):
    openai.api_key = os.getenv("OPENAI_API_KEY")

    expense_str = ", ".join(f"{k}: ${v:.2f}" for k, v in expenses.items())
    prompt = (
        f"My monthly income is ${income:.2f}. "
        f"My expenses are: {expense_str}. "
        f"I want to save ${savings_goal:.2f} per month. "
        f"Suggest 3-5 concise and practical personal finance tips to help me achieve this savings goal."
    )

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )
        print("\n📌 Budgeting Tips:")
        print(response.choices[0].message.content.strip())
    except Exception as e:
        print("Error calling OpenAI API:", e)

def main():
    print("==== Personal Finance Dashboard ====")
    income = get_monthly_income()
    savings_goal = get_savings_goal(income)
    expenses = get_expenses()

    if sum(expenses.values()) > income:
        print("Warning: Your expenses exceed your income!")

    tips_thread = threading.Thread(target=generate_gpt_tips, args=(income, expenses, savings_goal))
    tips_thread.start()

    plot_pie_chart(income, expenses, savings_goal)
    tips_thread.join()

if __name__ == '__main__':
    main()
