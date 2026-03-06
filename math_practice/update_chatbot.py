import re

new_faq = """    faq = {
        'hi': "Hi! I'm your Stride Bot! 🚀 I'm here to help you find links, check grades, and navigate Cascade Virtual Academy. Before we start, remember: I am a helper: I give tips, but you do the thinking. I'm not a calculator: Double-check my math! Stay Safe: Keep your private info (like your address) to yourself. What can I help you find today?",
        'hello': "Hi! I'm your Stride Bot! 🚀 I'm here to help you find links, check grades, and navigate Cascade Virtual Academy. Before we start, remember: I am a helper: I give tips, but you do the thinking. I'm not a calculator: Double-check my math! Stay Safe: Keep your private info (like your address) to yourself. What can I help you find today?",
        'hey': "Hi! I'm your Stride Bot! 🚀 I'm here to help you find links, check grades, and navigate Cascade Virtual Academy. Before we start, remember: I am a helper: I give tips, but you do the thinking. I'm not a calculator: Double-check my math! Stay Safe: Keep your private info (like your address) to yourself. What can I help you find today?",
        'missing class': "Click Courses > All Courses and click the Star next to your class to see it on your Dashboard.",
        'find class': "Click Courses > All Courses and click the Star next to your class to see it on your Dashboard.",
        'where is my work': "Always look in the Modules tab for your weekly assignments.",
        'finding work': "Always look in the Modules tab for your weekly assignments.",
        'module': "Always look in the Modules tab for your weekly assignments.",
        'engageli': "Go to your Canvas Calendar. Click the event for today's date to find your Engageli link. If the calendar is empty, make sure your classes are checked on the right side of the screen!",
        'live class': "Go to your Canvas Calendar. Click the event for today's date to find your Engageli link. If the calendar is empty, make sure your classes are checked on the right side of the screen!",
        'meeting': "Go to your Canvas Calendar. Click the event for today's date to find your Engageli link. If the calendar is empty, make sure your classes are checked on the right side of the screen!",
        'link': "Go to your Canvas Calendar. Click the event for today's date to find your Engageli link. If the calendar is empty, make sure your classes are checked on the right side of the screen!",
        'join': "Go to your Canvas Calendar. Click the event for today's date to find your Engageli link. If the calendar is empty, make sure your classes are checked on the right side of the screen!",
        'online class': "Go to your Canvas Calendar. Click the event for today's date to find your Engageli link. If the calendar is empty, make sure your classes are checked on the right side of the screen!",
        'empty calendar': "Check the boxes next to your class names on the right side of the Calendar screen to make them appear.",
        'not load': "1. Refresh the page. 2. Use Google Chrome. 3. Try an Incognito Window. 4. Message your teacher in the Canvas Inbox if you still can't get in.",
        'broken': "1. Refresh the page. 2. Use Google Chrome. 3. Try an Incognito Window. 4. Message your teacher in the Canvas Inbox if you still can't get in.",
        'can\\'t get into class': "1. Refresh the page. 2. Use Google Chrome. 3. Try an Incognito Window. 4. Message your teacher in the Canvas Inbox if you still can't get in.",
        'loading forever': "1. Refresh the page. 2. Use Google Chrome. 3. Try an Incognito Window. 4. Message your teacher in the Canvas Inbox if you still can't get in.",
        'technical difficulties': "Call Stride Tech Support at 866-512-2273 or visit help.k12.com. They are open 7 days a week!",
        'late': "You have 2 weeks after the due date to turn in any assignment for full credit. After 2 weeks, the assignment will lock and you won't be able to turn it in!",
        'due date': "You have 2 weeks after the due date to turn in any assignment for full credit. After 2 weeks, the assignment will lock and you won't be able to turn it in!",
        '2 weeks': "You have 2 weeks after the due date to turn in any assignment for full credit. After 2 weeks, the assignment will lock and you won't be able to turn it in!",
        'turn in': "Click the big Submit Assignment button at the top right. Select your file and click Submit again. Look for the confetti! 🎉",
        'submit': "Click the big Submit Assignment button at the top right. Select your file and click Submit again. Look for the confetti! 🎉",
        'upload': "Click the big Submit Assignment button at the top right. Select your file and click Submit again. Look for the confetti! 🎉",
        'hand in': "Click the big Submit Assignment button at the top right. Select your file and click Submit again. Look for the confetti! 🎉",
        'grades': "Click View Grades on your Dashboard, or the Grades tab inside a course. You can even type in 'What-If' scores to see how a grade might change!",
        'how am i doing': "Click View Grades on your Dashboard, or the Grades tab inside a course. You can even type in 'What-If' scores to see how a grade might change!",
        'score': "Click View Grades on your Dashboard, or the Grades tab inside a course. You can even type in 'What-If' scores to see how a grade might change!",
        'report card': "Click View Grades on your Dashboard, or the Grades tab inside a course. You can even type in 'What-If' scores to see how a grade might change!",
        'am i failing': "Click View Grades on your Dashboard, or the Grades tab inside a course. You can even type in 'What-If' scores to see how a grade might change!",
        'star360': "Go to Resources > ClassLink > Renaissance (the big 'R' app). You will take this reading and math test at the beginning, middle, and end of the year.",
        'renaissance': "Go to Resources > ClassLink > Renaissance (the big 'R' app). You will take this reading and math test at the beginning, middle, and end of the year.",
        'testing': "Go to Resources > ClassLink > Renaissance (the big 'R' app). You will take this reading and math test at the beginning, middle, and end of the year.",
        'reading test': "Go to Resources > ClassLink > Renaissance (the big 'R' app). You will take this reading and math test at the beginning, middle, and end of the year.",
        'math test': "Go to Resources > ClassLink > Renaissance (the big 'R' app). You will take this reading and math test at the beginning, middle, and end of the year.",
        'id': "Click Account > Profile for your ID number. Click Account > Settings to see your school email address on the right side.",
        'student number': "Click Account > Profile for your ID number. Click Account > Settings to see your school email address on the right side.",
        'email': "Click Account > Profile for your ID number. Click Account > Settings to see your school email address on the right side.",
        'username': "Click Account > Profile for your ID number. Click Account > Settings to see your school email address on the right side.",
        'newsletter': "You can find our March Newsletter at this link: https://www.smore.com/ Check it for important dates and school updates!",
        'contact': "You can email Jmcallister@onlineoregon.org or use the Inbox icon on the left side of Canvas to send a message.",
        'talk to my teacher': "It sounds like you need a human expert! 🧠 Since I'm just an AI, I might not have the exact answer you need. Here is how to reach Mrs. McAllister: Email me: Jmcallister@onlineoregon.org or click the Canvas Inbox!",
        'i\\'m confused': "It sounds like you need a human expert! 🧠 Since I'm just an AI, I might not have the exact answer you need. Here is how to reach Mrs. McAllister: Email me: Jmcallister@onlineoregon.org or click the Canvas Inbox!",
        'tech support': "Call Stride Tech Support at 866-512-2273 or visit help.k12.com. They are open 7 days a week!",
        'help desk': "Call Stride Tech Support at 866-512-2273 or visit help.k12.com. They are open 7 days a week!",
        'phone number': "Call Stride Tech Support at 866-512-2273 or visit help.k12.com. They are open 7 days a week!",
        'break': "Looking for a break? 🏝️ Here are the upcoming days with No School: Spring Break: March 23–27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5",
        'holiday': "Looking for a break? 🏝️ Here are the upcoming days with No School: Spring Break: March 23–27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5",
        'no school': "Looking for a break? 🏝️ Here are the upcoming days with No School: Spring Break: March 23–27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5",
        'spring break': "Looking for a break? 🏝️ Here are the upcoming days with No School: Spring Break: March 23–27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5",
        'easter': "Looking for a break? 🏝️ Here are the upcoming days with No School: Spring Break: March 23–27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5",
        'when is school over': "Looking for a break? 🏝️ Here are the upcoming days with No School: Spring Break: March 23–27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5",
        'last day': "Looking for a break? 🏝️ Here are the upcoming days with No School: Spring Break: March 23–27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5",
        'days off': "Looking for a break? 🏝️ Here are the upcoming days with No School: Spring Break: March 23–27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5",
        'canvas down': "Sometimes Canvas has a 'hiccup'. Wait 5 minutes and try again. Make sure your Wi-Fi is still connected. Use this time to read your school book or practice math facts offline!",
        'pacing': "Try to finish at least one lesson in each subject every day. Look at the To-Do list on your Dashboard. It's better to do one lesson correctly than three lessons too fast.",
        'done for the day': "✅ Did you submit all your assignments and see the Confetti? ✅ Did you check Canvas Inbox? ✅ Is your laptop plugged in? Great job! See you at the next Engageli session! 🌟",
        'address': "🚩 Privacy Check! Remember to keep your personal info safe. Even though your teacher isn't reading this chat, it's a great habit to never share private details with an AI!",
        'phone': "🚩 Privacy Check! Remember to keep your personal info safe. Even though your teacher isn't reading this chat, it's a great habit to never share private details with an AI!",
        'street': "🚩 Privacy Check! Remember to keep your personal info safe. Even though your teacher isn't reading this chat, it's a great habit to never share private details with an AI!",
        'password': "🚩 Privacy Check! Remember to keep your personal info safe. Even though your teacher isn't reading this chat, it's a great habit to never share private details with an AI!",
        'calculate': "⚠️ Double-check me! Large language models like me are helpful for steps, but we can sometimes get the final math answer wrong. Don't forget to use your own thinking!",
        'plus': "⚠️ Double-check me! Large language models like me are helpful for steps, but we can sometimes get the final math answer wrong. Don't forget to use your own thinking!",
        'equals': "⚠️ Double-check me! Large language models like me are helpful for steps, but we can sometimes get the final math answer wrong. Don't forget to use your own thinking!",
        'math help': "⚠️ Double-check me! Large language models like me are helpful for steps, but we can sometimes get the final math answer wrong. Don't forget to use your own thinking!",
        'help': "I can help with: 'Navigating Canvas', 'Troubleshooting the Calendar', 'Turning in Assignments', 'Checking Your Grades', 'Engageli Live Classes', 'Late Work', 'Star360 Testing', and 'Support'."    }"""

with open('app.py', 'r') as f:
    text = f.read()

# Replace between "    faq = {" and "    # Simple keyword matching"
match = re.search(r'    faq = \{.*?\n    \}\n', text, re.DOTALL)
if match:
    text = text.replace(match.group(0), new_faq + "\n")
else:
    print("Could not match faq dict in app.py")

with open('app.py', 'w') as f:
    f.write(text)

print("Updated app.py")

