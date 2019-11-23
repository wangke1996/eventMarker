import React, {Component} from 'react';
import {Layout, Menu, Table, Icon, Row, Col, Progress, Typography} from 'antd';
import {getUserName} from "../login/auth";
import {contribution, getProgress} from "../lib/getData";
import './main.css';

const {Title, Paragraph} = Typography;
const {Content, Footer} = Layout;
const IconFont = Icon.createFromIconfontCN({scriptUrl: '//at.alicdn.com/t/font_1183938_s7u7xarqf5.js',});

class ProgressBar extends Component {
    state = {
        labeled: 0,
        unlabeled: 1,
    };

    componentWillMount() {
        getProgress((labeled, unlabeled) => this.setState({labeled, unlabeled}));
    }

    render() {
        const {labeled, unlabeled} = this.state;
        const percent = Math.round(1000 * labeled / (labeled + unlabeled)) / 10;
        return (
            <div className='center'>
                <Title level={3}>整体进度</Title>
                <Paragraph>剩余{unlabeled}条</Paragraph>
                <Progress
                    type="circle"
                    strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                    }}
                    percent={percent}
                />
            </div>
        )
    }
}

export class ContributionView extends Component {
    state = {
        showType: 'total',
        data: {},
    };
    rankBoard = (rankData) => {
        const currentUser = getUserName();
        const columns = [{
            title: '用户',
            dataIndex: 'user',
            key: 'user',
            className: 'contributionUser',
            render: (text, record) => {
                switch (record.rank) {
                    case 1:
                        return <span><IconFont type="icon-goldMedal" style={{fontSize: '2em'}}/>{text}</span>;
                    case 2:
                        return <span><IconFont type="icon-silverMedal" style={{fontSize: '1.5em'}}/>{text}</span>;
                    case 3:
                        return <span><IconFont type="icon-bronzeMedal" style={{fontSize: '1.5em'}}/>{text}</span>;
                    default:
                        return text;
                }
            }
        }, {
            title: '新闻条数',
            dataIndex: 'count',
            key: 'count'
        }, {
            title: '排名',
            dataIndex: 'rank',
            key: 'rank',
            className: 'contributionRank'
        }];
        return <Table columns={columns} dataSource={rankData} rowKey='rank' rowClassName={record => {
            let className = record.user === currentUser ? 'currentUserContribution' : 'otherUserContribution';
            switch (record.rank) {
                case 1:
                    className += ' contributionGold';
                    break;
                case 2:
                    className += ' contributionSilver';
                    break;
                case 3:
                    className += ' contributionBronze';
                    break;
                default:
                    className += '';
            }
            return className;
        }
        }/>
    };
    tips = (rankData, currentUser) => {
        if (!rankData)
            return '';
        const currentRank = rankData.map(d => d.user).indexOf(currentUser);
        if (currentRank < 0)
            return '你怎么啥也没干，快去干活 (︶︿︶)';
        if (currentRank === 0)
            return '你好棒棒，we are the champions []~(￣▽￣)~*';
        if (currentRank < 3)
            return '诶哟不错，请继续保持 (*^▽^*)';
        return '只能说一般，请加油哦 (*/ω＼*)';
    };
    handleMenuClick = item => this.setState({showType: item.key});

    componentWillMount() {
        contribution((data) => this.setState({data}))
    }

    render() {
        const rankData = this.state.data[this.state.showType];
        return (
            <Layout className='contentLayout'>
                <Menu mode="horizontal" selectedKeys={this.state.showType} onClick={this.handleMenuClick}>
                    <Menu.Item key='total'>累计排行榜</Menu.Item>
                    <Menu.Item key='today'>今日排行榜</Menu.Item>
                </Menu>
                <Content className='content'>
                    <div className='contributionRank'>
                        <header>
                            <h2>贡献排行榜（{this.state.showType === 'today' ? '今日' : '累计'}）</h2>
                            <h3 className='tips'>{this.tips(rankData, getUserName())}</h3>
                        </header>
                        <Row type='flex' justify='center' align='top' gutter={32}>
                            <Col span={12}>
                                {this.rankBoard(rankData)}
                            </Col>
                        </Row>
                    </div>
                </Content>
                <Footer className='footer'>
                    <ProgressBar/>
                </Footer>
            </Layout>
        )
    }
}