from django.http import JsonResponse
import json
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from rest_framework.decorators import api_view
import pandas as pd
import io

@api_view(['POST'])
def ai_coach_view(request):
    """
    Receives a CSV file and a question from the frontend, then processes
    them with the AI agent.
    """
    try:
        # Get the uploaded CSV file and question from the request
        csv_file = request.FILES.get('csv_file')
        user_question = request.POST.get('question')

        if not csv_file or not user_question:
            return JsonResponse({'advice': 'Error: Missing CSV file or question.'}, status=400)

        # Read the CSV file into a pandas DataFrame
        csv_data = csv_file.read().decode('utf-8')
        df = pd.read_csv(io.StringIO(csv_data))
    
    except Exception as e:
        return JsonResponse({'advice': f'Error reading file: {str(e)}'}, status=400)
    # Calculate the total spending and create a spending summary
    total_spent = df['amount'].sum()
    spending_summary = df.groupby('category')['amount'].sum().to_string()

    # Create a dynamic prompt that includes the spending data and user's question
    prompt_template = PromptTemplate.from_template("""
    You are FinRight AI, a financial coach.
    Here is a summary of the user's spending from their transactions:
    {spending_summary}

    The user's question is: "{user_question}"

    Provide a clear, helpful answer to the user's question based on their spending data.
    """)

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

    formatted_prompt = prompt_template.format(
        spending_summary=spending_summary,
        user_question=user_question
    )
    
    response = llm.invoke(formatted_prompt)
    advice = response.content if hasattr(response, "content") else str(response)
    
    return JsonResponse({
        "advice": advice
    })
