import { Box, Card, Stack, Typography, useTheme } from '@mui/material';

import { OrderProcessorTable } from '@/components';

const OrderProcessor = () => {
	const theme = useTheme();

	return (
		<Stack direction='column' gap='1.5rem'>
			<Card sx={{ padding: '1.5rem' }} data-cy='purchase-history-table'>
				<Stack direction='column' gap='1rem'>
					<Box>
						<Typography
							variant='subtitle1'
							sx={{ color: theme.palette.common.black }}
						>
							Order Processor UI
						</Typography>
						<Typography
							variant='subtitle2'
							sx={{ color: theme.palette.text.primary }}
						>
							Purpose: keep track of orders that got matched by whom, when and
							at what price
						</Typography>
					</Box>
					<OrderProcessorTable data={[]} />
				</Stack>
			</Card>
		</Stack>
	);
};

export default OrderProcessor;
