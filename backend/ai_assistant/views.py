from django.http import JsonResponse
import json
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

def analyze_spending(request):
    # Load mock data
    with open(r"C:\Users\Dell\OneDrive\Desktop\GIthub\FinRight-AI\backend\data\mock_data.json", "r") as f:
        users = json.load(f)

    user = users[0]  # just pick first user for demo

    # Prepare spending summary
    total_spent = sum(tx["amount"] for tx in user["transactions"])
    spending_text = "\n".join([f"{tx['category']}: ${tx['amount']}" for tx in user["transactions"]])

    # LangChain prompt
    prompt = PromptTemplate.from_template("""
    You are FinRight AI, a financial coach. 
    The user has an income of ${income}.
    Here are their expenses:
    {spending}
    
    Give them personalized budgeting advice and one motivational coaching tip.
    """)

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

    # Use .invoke instead of deprecated .predict
    formatted_prompt = prompt.format(income=user["income"], spending=spending_text)
    response = llm.invoke(formatted_prompt)

    # Extract content (LangChain returns a ChatMessage object)
    advice = response.content if hasattr(response, "content") else str(response)

    return JsonResponse({
        "user": user["name"],
        "income": user["income"],
        "advice": advice
    })
