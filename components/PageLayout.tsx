// import { Breadcrumb as BreadcrumbType } from '@/models/utils';
// import { cn } from '@/services/utils';
// import { View } from 'react-native';
// import { ScrollView } from 'react-native-gesture-handler';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Breadcrumb from './breadcrumb';
// import CustomPullToRefreshOnRelease from './pullToRefresh';

// const PageLayout = ({ children, onRefresh, breadcrumbData, className }: { children: React.ReactNode, onRefresh: () => Promise<any>, breadcrumbData?: BreadcrumbType[], className?: string }) => {
//     const insets = useSafeAreaInsets();

//     return (
//         <View className={cn('py-4 gap-4 flex-1', className)} >
//             {breadcrumbData && <Breadcrumb breadcrumb={breadcrumbData} />}
//             <CustomPullToRefreshOnRelease onRefresh={onRefresh}>
//                 <ScrollView contentContainerClassName='gap-4 px-4' style={{ paddingBottom: insets.bottom + 10 }}>
//                     {children}
//                 </ScrollView>
//             </CustomPullToRefreshOnRelease>
//         </View>

//     );
// };

// export default PageLayout;

import { Breadcrumb as BreadcrumbType } from '@/models/utils';
import { cn } from '@/services/utils';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Breadcrumb from './breadcrumb';
import CustomPullToRefreshOnRelease from './pullToRefresh';

interface PageLayoutProps {
    children: React.ReactNode,
    onRefresh?: () => Promise<any>,
    breadcrumbData?: BreadcrumbType[],
    className?: string
}

const PageLayout = ({
    children,
    onRefresh,
    breadcrumbData,
    className
}: PageLayoutProps) => {
    const insets = useSafeAreaInsets();

    return (
        <View className={cn('py-4 gap-4 flex-1', className)}>
            {breadcrumbData && <Breadcrumb breadcrumb={breadcrumbData} />}
            {onRefresh &&
                <CustomPullToRefreshOnRelease
                    onRefresh={onRefresh}
                    contentContainerClassName='gap-4 px-4'
                    contentContainerStyle={{ paddingBottom: insets.bottom + 65 }}
                >
                    {children}
                </CustomPullToRefreshOnRelease>
            }
            {!onRefresh && children}
        </View>
    );
};

export default PageLayout;
