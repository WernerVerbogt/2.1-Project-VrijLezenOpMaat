import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

// This is still a demo, will be worked out later

@Injectable()
export class UsersService {
    private readonly users = [ 
        {
            userId: 1,
            username: 'john',
            password: 'changeme',
        },
        {
            userId: 2,
            username: 'Piet',
            password: 'guesswhat'
        },
    ];

    async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.username === username)
    }
}
