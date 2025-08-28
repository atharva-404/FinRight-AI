from django.http import JsonResponse
import json
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from rest_framework.decorators import api_view
import pandas as pd
import io
import pdfplumber

@api_view(['POST'])
def ai_coach_view(request):
    """
    Receives a file (CSV or PDF) and a question from the frontend, then processes
    them with the AI agent.
    """
    try:
        # Get the uploaded file and question from the request
        file = request.FILES.get('file')
        user_question = request.POST.get('question')

        if not file or not user_question:
            return JsonResponse({'advice': 'Error: Missing file or question.'}, status=400)

        # Determine the file type based on its name
        filename = file.name
        if filename.endswith('.csv'):
            # Handle CSV file
            csv_data = file.read().decode('utf-8')
            df = pd.read_csv(io.StringIO(csv_data))
        elif filename.endswith('.pdf'):
            # Handle PDF file
            text_data = ""
            with pdfplumber.open(file) as pdf:
                for page in pdf.pages:
                    text_data += page.extract_text() or ""
            
            # Here, we assume the PDF text is structured enough to be processed.
            # You would need a more sophisticated parser to handle various bank statement formats.
            # This is a very basic example.
            # For a real-world app, you'd use a more robust information extraction library.
            
            # Simple line-by-line parsing assuming a "Description, Amount" format
            data_list = []
            lines = text_data.split('\n')
            for line in lines:
                parts = line.split(',')
                if len(parts) == 2 and parts[1].strip().replace('.', '', 1).isdigit():
                    # Assuming the first part is a category and the second is a numeric amount
                    data_list.append({'category': parts[0].strip(), 'amount': float(parts[1].strip())})
            
            df = pd.DataFrame(data_list)
        else:
            return JsonResponse({'advice': 'Error: Unsupported file type. Please upload a CSV or PDF.'}, status=400)
    
    except Exception as e:
        return JsonResponse({'advice': f'Error processing file: {str(e)}'}, status=400)

    # Check if the DataFrame has the required columns
    if 'amount' not in df.columns or 'category' not in df.columns:
        return JsonResponse({'advice': 'Error: The uploaded file does not contain the required "amount" or "category" columns.'}, status=400)

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
