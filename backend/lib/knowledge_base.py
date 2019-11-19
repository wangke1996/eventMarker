from backend.lib.config import CONFIG
from backend.lib.data_helper import load_json


class ListNodes(object):
    def __init__(self, data):
        self.data = data

    @staticmethod
    def contain_query(node, query):
        if query in node['name']:
            return True
        for synonym in node['synonym']:
            if query in synonym:
                return True
        return False

    def search(self, query):
        if query is None or query == '':
            return []
        return [x['name'] for x in self.data if self.contain_query(x, query)]


class Food(object):
    def __init__(self):
        food_data = load_json(CONFIG.food_json)
        self.nodes = ListNodes(food_data)

    def search(self, query):
        return self.nodes.search(query)


class Pollutant(object):
    def __init__(self):
        pollutant_data = load_json(CONFIG.pollutant_json)
        self.nodes = {}
        for k, v in pollutant_data.items():
            self.nodes[k] = ListNodes(v)

    def search(self, query):
        search_res = {}
        for k, v in self.nodes.items():
            res = v.search(query)
            if len(res) == 0:
                continue
            search_res[k] = res
        return search_res


class KnowledgeBase(object):
    def __init__(self):
        self.food = Food()
        self.pollutant = Pollutant()
        self.population = load_json(CONFIG.population_json)

    def search_food(self, query):
        return self.food.search(query)

    def search_pollutant(self, query):
        return self.pollutant.search(query)

    def get_population_category(self):
        return self.population


KNOWLEDGE = KnowledgeBase()
