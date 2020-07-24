import os
# import pandas as pd
import json
import datetime as dt

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session,sessionmaker
from sqlalchemy import create_engine, distinct, func, inspect
from sqlalchemy import MetaData,Table,Column
from flask import Flask, jsonify, render_template, send_file
from flask_sqlalchemy import SQLAlchemy
from config import ServerName, UserName, Password, DataBase

application = app = Flask(__name__)


#################################################
# Database Setup
#################################################

# app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL','') or 
engine= create_engine(f"postgres://{UserName}:{Password}@{ServerName}/{DataBase}")
#os.environ.get('DATABASE_URL','') or 
# db = SQLAlchemy(app)
# engine = create_engine("postgres://{UserName}:{Password}@localhost:5432/{DataBase}")


# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)
print("base.classes", Base.classes.items())

# Save references to each table
code = Base.classes.code
earthquakes = Base.classes.earthquakes
emissions = Base.classes.emissions
eruptions = Base.classes.eruptions


@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

#home route
@app.route("/earthquake")
def allearthquakes():
    """Return all the earthquake data"""
    session = Session(engine)

    data= session.query(earthquakes.date, earthquakes.latitude, earthquakes.longitude, earthquakes.mag, earthquakes.depth, earthquakes.id, earthquakes.place).all()
    session.close()
    # data= earthquakes.find()
    allearthquakes= []
    for  date, latitude, longitude, mag, depth, id, place in data:
        earthquake_dict={}
        earthquake_dict["date"]= date
        earthquake_dict["latitude"]= float(latitude)
        earthquake_dict["longitude"]= float(longitude)
        earthquake_dict["mag"]= float(mag)
        earthquake_dict["depth"]= float(depth)
        earthquake_dict["id"]= id
        earthquake_dict["place"]= place
        allearthquakes.append(earthquake_dict)
    print("------------"*10)
    print(allearthquakes[0])
    return jsonify(allearthquakes)

@app.route("/emission")
def allemissions():
    # Create our session 
    session = Session(engine)

    """Return all emission data"""
    # Query all useful emission data

    results = session.query(emissions.Emission_ID, emissions.VolcanoNumber, emissions.VolcanoName, emissions.SO2_Kilotons, emissions.StartDate, emissions.EndDate).all()
    session.close()

    # Create a dictionary and append to a list of emission data
    allemissions = []
    for id, vol_num, vol_name, so2, start, end in results:
        row = {}
        row["id"] = id
        row["volcano_number"] = vol_num
        row["volcano_name"] = vol_name
        row["so2"] = float(so2)
        row["start_date"] = start
        row["end_date"] = end
        allemissions.append(row)

    return jsonify(allemissions)

# @app.route("/database/<data>")
# def database(data):
#     session= Session(engine)
#     """It includes top 10 data of each table"""
#     qry= session.query

@app.route("/eruption")
def alleruptions():
    # Create our session 
    session = Session(engine)

    """Return all eruption data"""
    # Query all useful eruption data
 
    results = session.query(eruptions.Activity_ID, eruptions.VolcanoNumber, eruptions.VolcanoName, eruptions.ExplosivityIndexMax, eruptions.StartDate, eruptions.EndDate, eruptions.ContinuingEruption, eruptions.LatitudeDecimal, eruptions.LongitudeDecimal).all()
    session.close()

    # Create a dictionary and append to a list of eruption data
    alleruptions = []
    for id, vol_num, vol_name, index, start, end, erupt, lat, long in results:
        row = {}
        row["id"] = id
        row["volcano_number"] = vol_num
        row["volcano_name"] = vol_name
        row["explosivity_index_max"] = index
        row["start_date"] = start
        row["end_date"] = end
        row["continuing_eruption"] = erupt
        row["lat"] = float(lat)
        row["long"] = float(long)
        alleruptions.append(row)

    return jsonify(alleruptions)

@app.route("/code")
def allcode():
    # Create our session 
    session = Session(engine)

    """Return code"""
    # Query all useful emission data

    results = session.query(code.VolcanoNumber, code.VolcanoName).all()
    session.close()

    # Create a dictionary and append to a list of emission data
    allcode = []
    for vol_num, vol_name in results:
        row = {}
        row["volcano_number"] = vol_num
        row["volcano_name"] = vol_name
        allcode.append(row)

    return jsonify(allcode)

@app.route("/analysis")
def analysis():
    """Return the decade page."""
    return render_template("analysis.html")

@app.route("/data")
def data():
    """Return the depthvmag page."""
    return render_template("data.html")

@app.route("/model")
def model():
    """Return the magvdepth page."""
    return render_template("model.html")

@app.route("/output")
def output():
    """Return filter file."""
    return send_file("output.geojson") 


# on of the routes has to be an API route that lat, long, radius...week 10 day 3 activity 8(variable rule)


if __name__ == "__main__":
    application.debug = False
    application.run()