import geopandas as gpd
import geojsonio

# %matplotlib inline
import pandas as pd
import geopandas as gp
import numpy as np
import matplotlib.pyplot as plt
from shapely.geometry import Point
from flask import Flask, jsonify

lat = 10.7536
long = -60.5253
radius = 3.6

def radius_search_function(lat, long, radius):
    print("Hello from a function")
    # From Jupyter Notebook Code
    # Read in geojson file
    ########################################################################
    data = gpd.read_file("static/js/earthquakes_data_json.geojson")
    ######################################################################
    # Create dataframe 
    df = pd.DataFrame(data)

    # df.head()

    # create Geometry series with lat / longitude
    geometry = [Point(xy) for xy in (df.geometry)]

    # Create GeoDataFrame
    points = gp.GeoDataFrame(df, crs=None, geometry=geometry)

    # Create new point   
    center_coord = [Point(long, lat)]  # Insert Lat and Long here
    center = gp.GeoDataFrame(crs=None, geometry=center_coord)

    circle = gp.GeoDataFrame(crs=None, geometry=center.buffer(radius))  # Insert radius here ( 1 = 50 miles)

    pointsinside = gp.sjoin(points,circle,how="inner")

    # Now the points outside the circle is just the difference 

    pointsoutside = points[~points.index.isin(pointsinside.index)]

    pointsinside.apply(lambda x: x.name).to_dict()

    # pointsinside["geometry"]

    pointsinside['lat'] = pointsinside['geometry'].y
    pointsinside['long'] = pointsinside['geometry'].x

    points_inside_radius = pointsinside.to_dict('records')

    df = pointsinside
    df = df.drop(columns = ['index_right', 'lat', 'long'])
    df.to_file("output.geojson", driver="GeoJSON")

radius_search_function(lat, long, radius)

