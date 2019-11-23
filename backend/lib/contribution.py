import os
import time
from backend.lib.data_helper import load_json, save_json
from backend.lib.config import CONFIG


class ContributionCounter(object):
    def __init__(self):
        if os.path.exists(CONFIG.contribution_json):
            self.data = load_json(CONFIG.contribution_json)
        else:
            self.data = {}

    def record(self, user, news_id):
        time_stamp = time.strftime('%Y-%m-%d_%H:%M:%S', time.localtime())
        if user not in self.data:
            self.data[user] = []
        self.data[user].append({'time': time_stamp, 'id': news_id})
        save_json(self.data, CONFIG.contribution_json)

    def today(self):
        res = []
        today_stamp = time.strftime('%Y-%m-%d', time.localtime())
        for k, v in self.data.items():
            count = len(list(filter(lambda x: x['time'].startswith(today_stamp), v)))
            res.append({'user': k, 'count': count})
        res.sort(key=lambda x: x['count'], reverse=True)
        for i, r in enumerate(res):
            r['rank'] = i + 1
        return res

    def total(self):
        res = [{'user': u, 'count': len(r)} for u, r in self.data.items()]
        res.sort(key=lambda x: x['count'], reverse=True)
        for i, r in enumerate(res):
            r['rank'] = i + 1
        return res


CONTRIBUTION = ContributionCounter()
