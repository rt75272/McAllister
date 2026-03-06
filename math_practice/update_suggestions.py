import re

new_suggestions = """            const suggestions = [
                "Hi!",
                "Hello!",
                "Hey!",
                "Missing class",
                "Find class",
                "Where is my work",
                "Finding work",
                "Module",
                "Engageli",
                "Live class",
                "Meeting",
                "Link",
                "Join",
                "Online class",
                "Empty calendar",
                "Not load",
                "Broken",
                "Can't get into class",
                "Loading forever",
                "Technical difficulties",
                "Late",
                "Due date",
                "Turn in",
                "Submit",
                "Upload",
                "Hand in",
                "Grades",
                "How am I doing",
                "Score",
                "Report card",
                "Am I failing",
                "Star360",
                "Renaissance",
                "Testing",
                "Reading test",
                "Math test",
                "ID",
                "Student number",
                "Email",
                "Username",
                "Newsletter",
                "Contact",
                "Talk to my teacher",
                "I'm confused",
                "Tech support",
                "Help desk",
                "Phone number",
                "Break",
                "Holiday",
                "No school",
                "Spring break",
                "Easter",
                "When is school over",
                "Last day",
                "Days off",
                "Canvas down",
                "Pacing",
                "Done for the day",
                "Address",
                "Phone",
                "Street",
                "Password",
                "Calculate",
                "Plus",
                "Equals",
                "Math help",
                "Help"
            ];"""

with open('static/js/chatbot.js', 'r') as f:
    text = f.read()

# Replace between "const suggestions = [" and "];"
match = re.search(r'            const suggestions = \[.*?\];', text, re.DOTALL)
if match:
    text = text.replace(match.group(0), new_suggestions)
else:
    print("Could not match suggestions array in static/js/chatbot.js")

with open('static/js/chatbot.js', 'w') as f:
    f.write(text)

print("Updated static/js/chatbot.js")

