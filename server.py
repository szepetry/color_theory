#!/usr/bin/python3
from flask import Flask, request, jsonify, render_template, redirect, session
import sqlite3
import json
from datetime import timedelta, datetime, timezone
import math

app = Flask(__name__)
app.config['SECRET_KEY'] = '<API_KEY>'    
f = open('data/learning.json')
learn_info = json.load(f)
f = open('data/quiz.json')
quiz_info = json.load(f)
f.close()
# pages

@app.route('/', methods=['GET'])
def index():
    if 'learn' not in session:
        session["learn"] = {
            "start": datetime.now(timezone.utc),
        }
        session.modified = True
    return render_template('index.html', isIndex=True, showTutorial=False)

@app.route('/create', methods=['GET'])
def create():
    toShow = False
    if 'create' not in session:
        session["create"] = True
        toShow = True
        session.modified = True
    return render_template('index.html', isIndex=False, showTutorial=toShow)


@app.route('/learn/<id>', methods=['GET'])
def learn(id):
    if id == 'end':
        difference = (datetime.now(timezone.utc) - session["learn"]["start"]).total_seconds()
        print("Total time spent learning: " + str(timedelta(seconds=difference)))
        return redirect("/quiz/start")
    session["learn"][str(id)] = datetime.now(timezone.utc)
    session.modified = True

    info = learn_info[id]
    return render_template('learn.html', learn=info, progress=str(math.floor(100*(int(id)/len(learn_info)))))

@app.route('/quiz/<id>', methods=['GET'])
def quiz(id):
    if 'user_score' not in session:
        return redirect("/quiz/start")
    if id == 'end':
        session["quiz"][str(id)] = datetime.now(timezone.utc)
        session.modified = True
        return redirect("/quiz/results")
    if id not in quiz_info:
        return redirect("/quiz/results")

    if str(session['user_quiz_current_question']) != id:
        return redirect("/quiz/" + str(session['user_quiz_current_question']))
    session["quiz"][str(id)] = datetime.now(timezone.utc)
    session.modified = True

    info = quiz_info[id]
    return render_template('quiz.html', quiz=info,score = session['user_score'])

@app.route('/quiz/results', methods=['GET'])
def results():
    if 'user_score' not in session:
        return redirect("/quiz/start")

    #calculating time per question
    time_data = {}
    print(session["quiz"])
    for i in range(1,len(session['quiz'])-1):
        time_data[str(i)] = (session["quiz"][str(i+1)] - session["quiz"][str(i)]).total_seconds()
    
    time_data[str(len(quiz_info))] = (session["quiz"]["end"] - session["quiz"][str(len(quiz_info))]).total_seconds()
    difference = (session["quiz"]["end"] - session["quiz"]["1"]).total_seconds()
    print("Total time spent in quiz: " + str(timedelta(seconds=difference)))
    return render_template('results.html',score = session["user_score"],status = session['user_quiz_status'],time_taken = time_data)

@app.route('/quiz/start', methods=['GET'])
def start_quiz():
    session["quiz"] = {}
    session['user_score'] = 0
    session['user_quiz_current_question'] = 1
    session['user_quiz_status'] = {}
    for i in range(1,len(quiz_info)+1):
        session['user_quiz_status'][i] = 0
    session.modified = True
    print(session['user_quiz_current_question'])
    return render_template('start_quiz.html')

# api endpoints

@app.route('/quiz/score', methods=['GET', 'POST'])
def score():
    json_data = request.get_json() 
    q_id = str(json_data["id"])
    session["user_score"] = session["user_score"] + 1
    session['user_quiz_status'][q_id] = 1
    session.modified = True
    return jsonify({'user_score': session["user_score"]})

@app.route('/quiz/update', methods=['POST'])
def update_current_question():
    session['user_quiz_current_question'] += 1
    session.modified = True
    return jsonify({'user_score':session['user_quiz_current_question']})

if __name__ == '__main__':
   app.run(debug = True)